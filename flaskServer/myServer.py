from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello_world():
    print("접속ㅋㅋ")
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1206, debug=True)