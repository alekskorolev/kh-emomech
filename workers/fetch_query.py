import redis
import threading
import pickle
import oauth2
import json


class Listener(threading.Thread):
    CONSUMER_KEY = "insert value"
    CONSUMER_SECRET = "insert value"
    ACCESS_KEY = "insert value"
    ACCESS_SECRET = "insert value"

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

    def work(self, item):
        token = item['data']
        query = self.redis.get(token)
        if (query):
            query_data = pickle.loads(query)
            result = self.oauth_req( 'https://api.twitter.com/1.1/search/tweets.json?q=%s' % (query_data['query'],))
            print(result)
            query_data['result'] = json.loads(result.decode())
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