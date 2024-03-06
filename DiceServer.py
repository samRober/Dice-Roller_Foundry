from aiohttp import web
import socketio

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)



@sio.event
def connect(sid, environ):
    print("connect ", sid)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)

    
@sio.event
def get_roll(sid, dice_info):
    print ("input roll")
    i = input()
    return i

if __name__ == '__main__':
    web.run_app(app)
