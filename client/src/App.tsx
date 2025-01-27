import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, AudioWaveform, Square, Triangle, AlertTriangle } from 'lucide-react';
import sound from '../sound.svg'
const SoundGenerator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440); // Default frequency (A4 note)
  const [gain, setGain] = useState(0.1); // Volume control (0 to 1)
  const [waveform, setWaveform] = useState('sine'); // Waveform type
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startSound = () => {
    // Initialize audio context on user interaction (required by browsers)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    
    // Create oscillator and gain node
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    // Configure oscillator
    oscillatorRef.current.type = waveform;
    oscillatorRef.current.frequency.setValueAtTime(
      frequency,
      audioContextRef.current.currentTime
    );

    // Configure gain (volume)
    gainNodeRef.current.gain.setValueAtTime(
      gain,
      audioContextRef.current.currentTime
    );

    // Connect nodes
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Start sound
    oscillatorRef.current.start();
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      setIsPlaying(false);
    }
  };

  const handleFrequencyChange = (e) => {
    const newFrequency = Number(e.target.value);
    setFrequency(newFrequency);
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(
        newFrequency,
        audioContextRef.current.currentTime
      );
    }
  };

  const handleGainChange = (e) => {
    const newGain = Number(e.target.value);
    setGain(newGain);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newGain,
        audioContextRef.current.currentTime
      );
    }
  };

  const handleWaveformChange = (e) => {
    const newWaveform = e.target.value;
    setWaveform(newWaveform);
    if (oscillatorRef.current) {
      oscillatorRef.current.type = newWaveform;
    }
  };

  const getWaveformIcon = () => {
    switch (waveform) {
      case 'square':
        return <Square className="text-blue-400" />;
      case 'triangle':
        return <Triangle className="text-blue-400" />;
      default:
        return <AudioWaveform className="text-blue-400" />;
    }
  };
  const freqwarning = () => {
    if(frequency > 10000){
      return true;
    }else{
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src = {sound} className="text-blue-400 mr-2 w-30 h-32" />
            <h1 className="text-4xl font-bold">SalamSignal</h1>
          </div>
          <p className="text-gray-400">Generate and explore sound frequencies</p>
        </header>

        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 shadow-xl">
          {/* Warning Banner */}
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-red-500">Safety Warning</h2>
            </div>
            <p className="mt-2 text-gray-300">
              Please use headphones responsibly. Start with low volume and increase gradually.
            </p>
          </div>

          {/* Frequency Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg">Frequency: {frequency} Hz</label>
            </div>
            <input
              type="range"
              min="20"
              max="20000"
              value={frequency}
              onChange={handleFrequencyChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>20 Hz</span>
              <span>2000 Hz</span>
            </div>
          </div>
          {
            freqwarning() ? (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" />
                  <h2 className="text-xl font-semibold text-red-500">Warning</h2>
                </div>
                <p className="mt-2 text-gray-300">
                  High frequency may cause hearing damage. Please use headphones responsibly.
                </p>
              </div>
            ) : null
          }

          {/* Volume Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg">Volume: {gain.toFixed(2)}</label>
              {gain > 0 ? (
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
              value={gain}
              onChange={handleGainChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Waveform Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg">Waveform</label>
              {getWaveformIcon()}
            </div>
            <select
              value={waveform}
              onChange={handleWaveformChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sine">Sine Wave</option>
              <option value="square">Square Wave</option>
              <option value="sawtooth">Sawtooth Wave</option>
              <option value="triangle">Triangle Wave</option>
            </select>
          </div>

          {/* Play/Stop Button */}
          <button
            onClick={isPlaying ? stopSound : startSound}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isPlaying ? 'Stop Sound' : 'Start Sound'}
          </button>

          {/* Frequency Range Info */}
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
};

export default SoundGenerator;