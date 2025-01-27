import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, AlertTriangle, AudioWaveform as Waveform } from 'lucide-react';

function App() {
  const [frequency, setFrequency] = useState<number>(440);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.1); // Start with low volume
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize Audio Context
    audioContextRef.current = new AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      // Create and configure oscillator
      const audioContext = audioContextRef.current!;
      const oscillator = audioContext.createOscillator();
      const gainNode = gainNodeRef.current!;
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      oscillator.start();
      oscillatorRef.current = oscillator;

      // Send frequency data to backend
      sendFrequencyData(frequency);
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    }
  }, [isPlaying, frequency]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
    }
  }, [volume]);

  const sendFrequencyData = async (freq: number) => {
    try {
      const response = await fetch('http://localhost:8000/frequency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency: freq }),
      });
      const data = await response.json();
      console.log('Frequency data sent:', data);
    } catch (error) {
      console.error('Error sending frequency data:', error);
    }
  };

  const getWarningLevel = (freq: number) => {
    if (freq < 20) return 'Very low frequencies may not be audible';
    if (freq > 15000) return 'High frequencies may cause discomfort';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Waveform size={48} className="text-blue-400 mr-2" />
            <h1 className="text-4xl font-bold">Frequency Generator</h1>
          </div>
          <p className="text-gray-400">Generate and explore sound frequencies from 0Hz to 20kHz</p>
        </header>

        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 shadow-xl">
          {/* Warning Banner */}
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-red-500">Safety Warning</h2>
            </div>
            <p className="mt-2 text-gray-300">
              Please use headphones responsibly. Extended exposure to loud sounds can damage your hearing.
              Start with low volume and increase gradually.
            </p>
          </div>

          {/* Frequency Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg">Frequency: {frequency.toFixed(1)} Hz</label>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg ${
                  isPlaying 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors`}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>0 Hz</span>
              <span>20,000 Hz</span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg">Volume</label>
              {volume > 0 ? (
                <Volume2 className="text-gray-400" />
              ) : (
                <VolumeX className="text-gray-400" />
              )}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Dynamic Warning Message */}
          {getWarningLevel(frequency) && (
            <div className="text-yellow-500 mt-4 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <span>{getWarningLevel(frequency)}</span>
            </div>
          )}

          {/* Frequency Ranges Info */}
          <div className="mt-8 bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Frequency Ranges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">20 Hz - 60 Hz: Sub-bass</p>
                <p className="text-gray-400">60 Hz - 250 Hz: Bass</p>
                <p className="text-gray-400">250 Hz - 500 Hz: Low midrange</p>
              </div>
              <div>
                <p className="text-gray-400">500 Hz - 2 kHz: Midrange</p>
                <p className="text-gray-400">2 kHz - 4 kHz: Upper midrange</p>
                <p className="text-gray-400">4 kHz - 20 kHz: Treble</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;