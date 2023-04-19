import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging

# Firebase Admin SDK를 초기화합니다.
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

registration_token = 'fzJmtvIEp02VoWhb35ygFJ:APA91bE84pchB2vwi6pZrFU21TaT3gT0QUYDqrn_LfuhsL_lQCxEnl4Hu0cyf6KZ7FBEnAmglc9ef4flzXGUpk48dl89Tm0Jc5El1poeNVdGCx9O__53YsobKwAqS4D210fc6LXICIM-'

# FCM 메시지를 보냅니다.
message = messaging.Message(
    notification=messaging.Notification(
        title='제목',
        body='fda'
    ),
    data={
        'subtitle': '부제목',
        'screen': '2',
    },
    token=registration_token
)

response = messaging.send(message)
print('Successfully sent message:', response)