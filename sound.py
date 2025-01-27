import numpy as np
import sounddevice as sd

def generate_sine_wave(frequency, duration, sample_rate=44100):
    """
    Generate a sine wave.

    :param frequency: Frequency of the wave (Hz)
    :param duration: Duration of the wave (seconds)
    :param sample_rate: Number of samples per second
    :return: Numpy array of the sine wave
    """
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    wave = 0.5 * np.sin(2 * np.pi * frequency * t)  # Amplitude is halved for safety
    return wave

def play_sound(wave, sample_rate=44100):
    """
    Play a generated waveform.
    """
    sd.play(wave, samplerate=sample_rate)
    sd.wait()  # Wait until the sound finishes playing

# Parameters
frequency = 440  # A4 note, 440 Hz
duration = 2     # 2 seconds
sample_rate = 44100

# Generate and play the sine wave
sine_wave = generate_sine_wave(frequency, duration, sample_rate)
play_sound(sine_wave)
