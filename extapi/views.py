# coding=utf-8 #
from django import http
from django.views.generic import View
import redis
import binascii
import json
import os
import pickle
import time


# queue lists:
# q_source - started query
# TBC
redis_conn_conf = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}



class ActionQueryView(View):

    def get_token(self, query):
        key = 'q:%s' % (query, )
        token = self.redis.get(key)
        if not token:
            token = binascii.hexlify(os.urandom(24))
            self.redis.set(key, token)

        return token.decode(encoding='utf8')

    def get_query(self, token, status=False, query_string=None):
        key = 't:%s' % (token, )
        query = self.redis.get(key)

        if query:
            query = pickle.loads(query)
            how_old = time.time() - query.get('last_update', 0)
            if how_old > 1800 and not status:
                query['status'] = 1 if (len(query.get('messages', [])) > 0) else 0
                self.redis.set(key, pickle.dumps(query))
                self.redis.publish('query_update', key)
        else:
            query = {
                'query': query_string,
                'metadata': {},
                'messages': [],
                'status': 0,
                'token': token,
            }
            self.redis.set(key, pickle.dumps(query))
            self.redis.publish('query_update', key)
        if hasattr(query['token'], 'decode'):
            query['token'] = query['token'].decode(encoding='utf8')
        return query

    @property
    def redis(self):
        pool = redis.ConnectionPool(**redis_conn_conf)
        rconn = redis.Redis(connection_pool=pool)
        return rconn

    def get(self, request, *args, **kwargs):
        query = request.GET.get('q')
        token = self.get_token(query)
        stored_query = self.get_query(token, query_string=query)
        return http.JsonResponse(stored_query)


class GetResultView(ActionQueryView):
    def get(self, request, *args, **kwargs):
        token = kwargs['token']
        stored_query = self.get_query(token, status=True)
        return http.JsonResponse(stored_query)
