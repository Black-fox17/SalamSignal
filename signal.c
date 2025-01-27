#include <stdio.h>
#include <math.h>
#include <portaudio.h>
#include <stdlib.h>


#define SAMPLE_RATE 44100 // Standard audio sample rate
#define AMPLITUDE 0.5     // Volume
#define TWO_PI 6.283185307179586476925286766559

typedef struct {
    double frequency; // Frequency of the sine wave
    double phase;     // Current phase of the sine wave
} SineWave;

static int audioCallback(const void *inputBuffer, void *outputBuffer,
                         unsigned long framesPerBuffer,
                         const PaStreamCallbackTimeInfo *timeInfo,
                         PaStreamCallbackFlags statusFlags,
                         void *userData) {
    SineWave *data = (SineWave *)userData;
    float *out = (float *)outputBuffer;
    (void)inputBuffer; // Prevent unused variable warning

    for (unsigned long i = 0; i < framesPerBuffer; i++) {
        *out++ = (float)(AMPLITUDE * sin(data->phase));
        data->phase += TWO_PI * data->frequency / SAMPLE_RATE;
        if (data->phase >= TWO_PI) {
            data->phase -= TWO_PI;
        }
    }
    return paContinue;
}

int main() {
    PaError err;
    SineWave sineWave = {440.0, 0.0}; // Default to A4 (440 Hz)

    printf("Initializing PortAudio...\n");
    err = Pa_Initialize();
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    PaStream *stream;
    err = Pa_OpenDefaultStream(&stream,
                               0,       // No input channels
                               1,       // One output channel (mono)
                               paFloat32, // 32-bit floating point output
                               SAMPLE_RATE,
                               256,     // Frames per buffer
                               audioCallback,
                               &sineWave);
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    printf("Starting audio stream...\n");
    err = Pa_StartStream(stream);
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    printf("Press 'q' to quit or enter frequency (in Hz):\n");
    char input[10];
    while (1) {
        fgets(input, sizeof(input), stdin);
        if (input[0] == 'q') break;
        double newFrequency = atof(input);
        if (newFrequency > 0) {
            sineWave.frequency = newFrequency;
            printf("Frequency set to %.2f Hz\n", sineWave.frequency);
        } else {
            printf("Invalid frequency. Try again.\n");
        }
    }

    printf("Stopping audio stream...\n");
    err = Pa_StopStream(stream);
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    printf("Terminating PortAudio...\n");
    Pa_Terminate();
    return 0;
}
