from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import numpy as np
import asyncio
import sounddevice as sd

app = FastAPI()

# Function to generate sine wave
def generate_sine_wave(frequency, duration, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    wave = 0.5 * np.sin(2 * np.pi * frequency * t)  # Amplitude halved for safety
    return wave

# WebSocket route
@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            frequency = data.get("frequency", 440)  # Default to 440 Hz (A4)
            duration = 0.1  # Short duration to stream continuously
            sample_rate = 44100

            # Generate sine wave
            wave = generate_sine_wave(frequency, duration, sample_rate)
            wave_list = wave.tolist()  # Convert numpy array to list for JSON serialization
            
            # Send waveform back to the client
            await websocket.send_json({"waveform": wave_list})

            # Play sound locally (optional)
            sd.play(wave, samplerate=sample_rate)
            await asyncio.sleep(duration)

    except WebSocketDisconnect:
        print("Client disconnected")
