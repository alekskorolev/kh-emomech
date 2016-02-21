import redis
import threading
import pickle
import oauth2
import json
import logging
import time
from datetime import timedelta

log = logging.getLogger('worker')

keys = [
    {
        'C_KEY': '9PUZfDYajB7bcuSernSDfumCV',
        'C_SEC': 'uhQzzklgN0OHvuuFzVm9qi1dUh8KTvdw8vZGWQc4WhKGw11tZ9',
        'A_KEY': '1567430544-BE4jCvNDGqarrNU1ql9o71YdKbP0HEk4KuaNXJb',
        'A_SEC': 'F1Vy30pF4xM85ldf6JLcrOkPa8nZfmrTw0yyCagN8w1wX',
    },
    {
        'C_KEY': 'xVPbRf4OkqnHpm3KIBTK2gmFs',
        'C_SEC': '36XtgFBXknCdP1jGVcD5wY7qiXEKS2uU8BVbRoQjPIfyiElWjE',
        'A_KEY': '1567430544-bCN19cpPGNjgTJhH2GghqoeHkgb1HxuU0TU5UMQ',
        'A_SEC': '0qohDGnWxczci4CsmTJkznt3vSiFVjRXaWy0EftI9j7C9',
    },
]

class Listener(threading.Thread):

    def __init__(self, r, channels):
        threading.Thread.__init__(self)
        self.redis = r
        self.pubsub = self.redis.pubsub()
        self.pubsub.subscribe(channels)

    def oauth_req(self, url, http_method="GET", post_body="", http_headers=None):
        consumer = oauth2.Consumer(key=keys[0]['C_KEY'], secret=keys[0]['C_SEC'])
        token = oauth2.Token(key=keys[0]['A_KEY'], secret=keys[0]['A_SEC'])
        client = oauth2.Client(consumer, token)
        resp, content = client.request(url.encode('utf-8'), method=http_method, body=post_body.encode(), headers=http_headers)
        return content

    def x_get_next(self):
        result_data = {}
        statuses = result_data.get('statuses', [])
        count = len(statuses) if statuses else 0
        if count == 100:
            print('|')
            last_id = result_data['statuses'][99]['id']
            if last_id > loaded_id:
                list = self.get_next_page(query, last_id=last_id)
                result_data['statuses'] += list.get('statuses', [])
            else:
                print(result.decode())
                print(count)
        else:
            print(result.decode())
            print(count)
        return result_data

    def get_page(self, query, last_id=0):
        url = 'https://api.twitter.com/1.1/search/tweets.json?lang=en&count=100&q=%s' % (query,)
        if last_id:
            url += "&max_id=%d" % (last_id, )
        print(url)
        result = self.oauth_req(url)
        result_data = json.loads(result.decode())

        return result_data

    def clear_data(self, list, loaded_id=0):
        clean_list = []
        for msg in list:
            clean_msg = {
                'created_at': msg.get('created_at'),
                'id': msg.get('id'),
                'text': msg.get('text'),
            }
            if msg.get('id') > loaded_id:
                clean_list.append(clean_msg)
        return clean_list

    def work(self, item):
        key = item['data']
        query = self.redis.get(key)
        if query:
            query_data = pickle.loads(query)
            query_string = query_data.get('query')
            max_loaded = query_data.get('loaded_id', 0)
            loaded_id = max_loaded
            result = self.get_page(query_string)
            clean_list = self.clear_data(result.get('statuses', []), loaded_id=loaded_id)
            query_data['messages'] += clean_list
            loaded = len(clean_list)
            while loaded == 100:
                query_data['status'] = 1
                self.redis.set(key, pickle.dumps(query_data))
                last = clean_list[99]['id']
                first = clean_list[0]['id']
                if max_loaded < first:
                    max_loaded = first
                time.sleep(2)
                result = self.get_page(query_string, last_id=last)
                clean_list = self.clear_data(result.get('statuses', []), loaded_id=loaded_id)
                query_data['messages'] += clean_list
                loaded = len(clean_list)
                print(2, "found count msgs: %d from last %d" % (loaded, last,))

            query_data['last_update'] = time.time()
            print(query_data['last_update'])
            query_data['loaded_id'] = max_loaded
            query_data['status'] = 2
            self.redis.set(key, pickle.dumps(query_data))

    def x_work(self, item):
        if True:
            result = self.redis.get(query_data.get('query'))
            if not result:
                result = self.get_next_page(query_data.get('query'))
                self.clear_data(result)
                self.redis.set(query_data['query'], pickle.dumps(result))
            else:
                result = pickle.loads(result)
                loaded_id = result.get('search_metadata', {}).get('max_id', 0)
                loaded_result = self.get_next_page(query_data.get('query'), loaded_id=loaded_id)
                self.clear_data(loaded_result, loaded_id=loaded_id)
                result['statuses'] = result.get('statuses', []) + loaded_result.get('statuses', [])
                result['search_metadata'] = loaded_result.get('search_metadata', result.get('search_metadata'))

            query_data['result'] = result
            log.log(2, len(result['statuses']))
            query_data['status'] = 1

            self.redis.set(key, pickle.dumps(query_data))
        else:
            print(2, "query not found: %s" % (key, ))

    def run(self):
        for item in self.pubsub.listen():
            if item['data'] == b'KILL':
                self.pubsub.unsubscribe()
                log.log(2, "unsubscribed and finished")
                break
            else:
                self.work(item)


if __name__ == "__main__":
    r = redis.Redis()
    client = Listener(r, ['query_update'])
    client.start()

    #r.publish('q_source', 'this will reach the listener')

    #r.publish('test', '0')