from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os
import random
import string

app = Flask(__name__)
DATA_FILE = 'urls.json'

# Load or initialize URL storage
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def load_urls():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_urls(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def generate_short_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shorten', methods=['POST'])
def shorten():
    original_url = request.form.get('original_url')
    custom_code = request.form.get('custom_code')
    data = load_urls()

    if custom_code:
        if custom_code in data:
            return "Custom code already taken.", 400
        short_code = custom_code
    else:
        while True:
            short_code = generate_short_code()
            if short_code not in data:
                break

    data[short_code] = original_url
    save_urls(data)
    short_url = request.host_url + short_code
    return jsonify({'short_url': short_url})

@app.route('/<code>')
def redirect_to_original(code):
    data = load_urls()
    if code in data:
        return redirect(data[code])
    return "URL not found", 404

if __name__ == '__main__':
    app.run(debug=True)
