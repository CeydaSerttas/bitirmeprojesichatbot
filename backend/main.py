# main.py

import os
import io
import wave
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import speech
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure APIs
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
speech_client = speech.SpeechClient()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-pro')

# FastAPI instance
app = FastAPI()

# CORS (Opsiyonel - frontend erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body model
class MessageInput(BaseModel):
    message: str

# Endpoint: Transcribe Audio
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
        sample_rate = wav_file.getframerate()

    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=sample_rate,
        language_code="tr-TR"
    )

    response = speech_client.recognize(config=config, audio=audio)
    transcript = response.results[0].alternatives[0].transcript if response.results else "Ses algılanamadı."
    return {"transcript": transcript}

# Endpoint: Generate Text from Gemini
@app.post("/generate/")
async def generate_gemini(input_data: MessageInput):
    chat = model.start_chat(history=[])
    response = chat.send_message(input_data.message)
    return {"response": response.text}
