#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdint.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

int main(int argc, char *argv[]) {
    // Parse command-line arguments
    if (argc < 2) {
        fprintf(stderr, "Usage: %s frequency [duration]\n", argv[0]);
        return 1;
    }

    double freq = atof(argv[1]);
    double duration = argc > 2 ? atof(argv[2]) : 3.0;
    const int sample_rate = 44100;

    // Validate input
    if (freq <= 0 || freq > sample_rate / 2) {
        fprintf(stderr, "Frequency must be between 1 Hz and %d Hz.\n", sample_rate / 2);
        return 1;
    }
    if (duration <= 0) {
        fprintf(stderr, "Duration must be a positive number.\n");
        return 1;
    }

    // Calculate samples and fade parameters
    int num_samples = (int)(duration * sample_rate);
    int fade_samples = (int)(0.01 * sample_rate); // 10ms fade
    const double amplitude = 32767.0; // Max 16-bit amplitude

    // Generate sine wave with fade-in/out
    for (int i = 0; i < num_samples; i++) {
        double t = (double)i / sample_rate;
        double value = sin(2 * M_PI * freq * t);
        
        // Apply fade to avoid clicks
        double gain = 1.0;
        if (i < fade_samples)
            gain = (double)i / fade_samples;
        else if (i >= num_samples - fade_samples)
            gain = (double)(num_samples - i - 1) / fade_samples;

        int16_t sample = (int16_t)(amplitude * value * gain);
        fwrite(&sample, sizeof(int16_t), 1, stdout);
    }

    return 0;
}