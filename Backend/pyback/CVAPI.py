# Pendiente las librerias con versiones en requirements.txt y libraries.json
import os, pytesseract, requests, base64
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

async def upload(user_id):
    if 'file' not in request.files:
        return { "message": "No file part in the request",
                "status": 400
                }

    file = request.files['file']
    if file.filename == '':
        return { "message": "No file selected",
                "status": 400
                }

    if file and allowed_file(file.filename):
        text = await process_ocr(file, user_id)
        save_text_to_file(text, user_id)
        return getChatGPT(user_id)
    else:
        return { "message": "Invalid file format",
                "status": 400
                }
    
def getCV(user_id):
    directory = f'Documents/{user_id}'

    if not os.path.exists(directory):
        return "The employee has not upload a CV"
    
    file_path = os.path.join(directory, 'CV.png')

    with open(file_path, 'rb') as file:
        image_data = file.read()

    base64_image = base64.b64encode(image_data).decode('utf-8')

    return jsonify({'image': base64_image})

def getGPTtext(user_id):
    directory = f'Documents/{user_id}'
    
    if not os.path.exists(directory):
        return "The employee has not upload a CV"

    file_path = os.path.join(directory, 'CVGPT.txt')

    with open(file_path, 'r') as file:
        file_contents = file.read()
    return jsonify({'content':file_contents})

def getChatGPT(user_id):
    chatUrl = 'https://api.openai.com/v1/completions'

    headers = {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
    }

    directory = f'Documents/{user_id}'
    file_path = os.path.join(directory, 'CVOCR.txt')

    with open(file_path, 'r') as file:
        file_contents = file.read()

    myprompt = 'I am an employer and this is an OCR scan of a CV. Please give me a summary of this candidate\'s profile in 50 words: ' + file_contents

    payload = {
        'model': 'text-davinci-003',
        'prompt': myprompt, 
        'temperature': 0.6,
        'max_tokens': 200 
    }

    response = requests.post(chatUrl, json=payload, headers=headers)
    data = response.json()

    full_summary = data['choices'][0]['text']
    
    file_path = os.path.join(directory, 'CVGPT.txt')  
    with open(file_path, 'w') as file:
        file.write(full_summary)

    return data


async def process_ocr(file, user_id):
    # Save the file to the current working directory
    directory = f'Documents/{user_id}'
    os.makedirs(directory, exist_ok=True)

    file_path = os.path.join(directory, 'CV.png')
    file.save(file_path)

    # Apply OCR using Tesseract
    text = await run_tesseract_ocr(file_path)

    # Delete the uploaded file
    # os.remove(file_path)

    return text

async def run_tesseract_ocr(file_path):
    return pytesseract.image_to_string(file_path)

def save_text_to_file(text, user_id):
    directory = f'Documents/{user_id}'
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = os.path.join(directory, 'CVOCR.txt')
    with open(file_path, 'w') as file:
        file.write(text)
        
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg'}
