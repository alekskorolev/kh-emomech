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
        'C_KEY': 'MTkfYrhDoZmrsLsfWUhUqHCtT',
        'C_SEC': '3qLSWmmiTD681GCjIHmr3N5AUO7a9ImvjIufRPLANLvVRgE18D',
        'A_KEY': '701479992874680321-bU1uSlQ88xO7D9xe5M1Ota4WhnNxn3u',
        'A_SEC': 'SUZccdPcTO8au7HKbxZYEJBgx7atnW1mxBiSEEJNY3Ute',
    },
    {
        'C_KEY': 'I5a2SbZ6kJMzCZSFVKavo01O9',
        'C_SEC': 'wnYUhzueWpkVzsnRA2P379hVglfwycY1mFAHFiIPee2mpmxfmo',
        'A_KEY': '701484146993065984-sYELcyC42HodlVspHzXrMgqSnIWpdGb',
        'A_SEC': '06XvjwVSKIMlUUxbRNKXxwMfvn8o1D7LVlxWQT70da2x4',
    },
    {
        'C_KEY': 'CAKM6guBzyNuSQobpXc57L7VR',
        'C_SEC': 'XyM5alNqUnXwFQx9i69npw0QMEB9lebj2fkZs9MeNWLNxtMaOZ',
        'A_KEY': '2888104553-MpKQ0cl1GHDkbtZWieMuIVKFGLcoYvPxJJb7UPH',
        'A_SEC': 'X8xb9Wj1rVdfGiRMB6NZj6WoTO3T04OGNY8sQfKfcac4o',
    },
    {
        'C_KEY': 'cdkBoHFO3JXsM1R6FiKJ7qbGP',
        'C_SEC': 'VhdpjOxsBRuOcZhFuccYdazxprSHtaQGhPyclfsE7YoQguRK1G',
        'A_KEY': '701491142613983232-qbTLEtZFZM54OgTzK9cvErqEArb7kgI',
        'A_SEC': 'XutvYnnmOfdVXvmrl5QGgM28KyiNceLe45rrc1IabB9gj',
    },
]


class Listener(threading.Thread):
    current_key = 0
    max_key = 5

    def __init__(self, r, channels):
        threading.Thread.__init__(self)
        self.redis = r
        self.pubsub = self.redis.pubsub()
        self.pubsub.subscribe(channels)

    def key(self):
        self.current_key += 1
        if self.current_key == self.max_key:
            self.current_key = 0
        return keys[self.current_key]

    def oauth_req(self, url, http_method="GET", post_body="", http_headers=None):
        key = self.key()
        consumer = oauth2.Consumer(key=key['C_KEY'], secret=key['C_SEC'])
        token = oauth2.Token(key=key['A_KEY'], secret=key['A_SEC'])
        client = oauth2.Client(consumer, token)
        resp, content = client.request(url.encode('utf-8'), method=http_method, body=post_body.encode(), headers=http_headers)
        return content

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
            ent = msg.get('entities') or []
            hts = []
            mda = []
            ht = ent.get('hashtags', [])
            for h in ht:
                hts.append(h.get('text'))
            md = msg.get('media') or []
            for m in md:
                mda.append(m.get('media_url'))
            place = msg.get('place') or {}
            clean_msg = {
                'created_at': msg.get('created_at'),
                'id': msg.get('id'),
                'text': msg.get('text'),
                'retweet_count': msg.get('retweet_count'),
                'hashtags': hts,
                'place': place.get('fill_name'),
                'media': mda
            }
            #clean_msg = msg
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
                time.sleep(1)
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