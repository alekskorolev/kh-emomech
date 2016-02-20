import redis
import threading
import pickle

class Listener(threading.Thread):
    def __init__(self, r, channels):
        threading.Thread.__init__(self)
        self.redis = r
        self.pubsub = self.redis.pubsub()
        self.pubsub.subscribe(channels)

    def work(self, item):
        token = item['data']
        query = self.redis.get(token)
        if (query):
            query_data = pickle.loads(query)
            print(query_data['query'])
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