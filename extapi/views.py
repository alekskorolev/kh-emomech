# coding=utf-8 #
from django import http
from django.views.generic import View
import redis
import binascii
import json
import os
import pickle


# queue lists:
# q_source - started query
# TBC
redis_conn_conf = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}

def get_token():
    token = binascii.hexlify(os.urandom(24)).decode()
    return token

def get_redis():
    pool = redis.ConnectionPool(**redis_conn_conf)
    rconn = redis.Redis(connection_pool=pool)
    return rconn

class ActionQueryView(View):
    def get(self, request, *args, **kwargs):
        query = request.GET.get('q')
        token = get_token()
        r = get_redis()
        r.set(token, pickle.dumps({"query": query, "status": 0}))
        r.publish('q_source', token)
        return http.JsonResponse({"token": token, "status": 0})


class GetResultView(View):
    def get(self, request, *args, **kwargs):
        token = kwargs['token']
        r = get_redis()
        data = r.get(token)
        if data:
            query_data = pickle.loads(data)
        else:
            query_data = {}
        return http.JsonResponse(query_data)