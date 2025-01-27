#include "soloud.h"
#include "soloud_sfxr.h"
#include <iostream>

int main() {
    SoLoud::Soloud soloud;         // SoLoud engine core
    SoLoud::Sfxr sfxr;             // Sfxr module for sound effects

    soloud.init();                 // Initialize SoLoud

    sfxr.loadPreset(SoLoud::Sfxr::COIN, 0);  // Generate a coin sound
    soloud.play(sfxr);             // Play the sine wave

    std::cout << "Playing sound. Press Enter to stop..." << std::endl;
    std::cin.get();                // Wait for user input to stop

    soloud.deinit();               // Clean up SoLoud
    return 0;
}
