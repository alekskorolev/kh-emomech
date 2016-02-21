import redis
import threading
import pickle
import oauth2
import json


class Listener(threading.Thread):
    CONSUMER_KEY = "xVPbRf4OkqnHpm3KIBTK2gmFs"
    CONSUMER_SECRET = "36XtgFBXknCdP1jGVcD5wY7qiXEKS2uU8BVbRoQjPIfyiElWjE"
    ACCESS_KEY = "1567430544-bCN19cpPGNjgTJhH2GghqoeHkgb1HxuU0TU5UMQ"
    ACCESS_SECRET = "0qohDGnWxczci4CsmTJkznt3vSiFVjRXaWy0EftI9j7C9"

    def __init__(self, r, channels):
        threading.Thread.__init__(self)
        self.redis = r
        self.pubsub = self.redis.pubsub()
        self.pubsub.subscribe(channels)

    def oauth_req(self, url, http_method="GET", post_body="", http_headers=None):
        consumer = oauth2.Consumer(key=self.CONSUMER_KEY, secret=self.CONSUMER_SECRET)
        token = oauth2.Token(key=self.ACCESS_KEY, secret=self.ACCESS_SECRET)
        client = oauth2.Client(consumer, token)
        resp, content = client.request(url.encode('utf-8'), method=http_method, body=post_body.encode(), headers=http_headers)
        return content

    def get_next_page(self, query, last_id=None):
        url = 'https://api.twitter.com/1.1/search/tweets.json?count=100&q=%s' % (query,)
        if last_id:
            url += "&max_id=%d" % (last_id, )
        result = self.oauth_req(url)
        result_data = json.loads(result.decode())
        count = len(result_data['statuses'])
        if count == 100:
            last_id = result_data['statuses'][99]['id']
            list = self.get_next_page(query, last_id=last_id)
            result_data['statuses'] += list['statuses']
        return result_data

    def work(self, item):
        token = item['data']
        query = self.redis.get(token)
        if (query):
            query_data = pickle.loads(query)
            result = self.get_next_page(query_data['query'])
            query_data['result'] = result
            print(len(result['statuses']))
            query_data['status'] = 1
            self.redis.set(token, pickle.dumps(query_data))
        else:
            print("query not found:", token)

    def run(self):
        for item in self.pubsub.listen():
            if item['data'] == b'KILL':
                self.pubsub.unsubscribe()
                print(self, "unsubscribed and finished")
                break
            else:
                self.work(item)


if __name__ == "__main__":
    r = redis.Redis()
    client = Listener(r, ['q_source'])
    client.start()

    #r.publish('q_source', 'this will reach the listener')

    #r.publish('test', '0')