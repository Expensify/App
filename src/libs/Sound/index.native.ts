import {createAudioPlayer, setAudioModeAsync} from 'expo-audio';
import type {AudioSource} from 'expo-audio';
import type {ValueOf} from 'type-fest';
import {getIsMuted, SOUNDS, withMinimalExecutionTime} from './BaseSound';

// Sound assets must be required at compile time
const SOUND_ASSETS: Record<ValueOf<typeof SOUNDS>, AudioSource> = {
    [SOUNDS.DONE]: require('@assets/sounds/done.mp3') as AudioSource,
    [SOUNDS.SUCCESS]: require('@assets/sounds/success.mp3') as AudioSource,
    [SOUNDS.ATTENTION]: require('@assets/sounds/attention.mp3') as AudioSource,
    [SOUNDS.RECEIVE]: require('@assets/sounds/receive.mp3') as AudioSource,
};

// Configure audio mode for in-app notification sounds:
// - playsInSilentMode: false — respect the device's silent/mute switch (iOS)
// - shouldPlayInBackground: false — push notification sounds are played by the system
// - interruptionMode: 'mixWithOthers' — don't interrupt other audio (e.g. music)
const audioModeConfigured = setAudioModeAsync({playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers'});

const playSound = async (soundFile: ValueOf<typeof SOUNDS>) => {
    if (getIsMuted()) {
        return;
    }

    const source = SOUND_ASSETS[soundFile];
    if (!source) {
        return;
    }

    // Wait for audio mode to be configured before playing to ensure the session
    // uses the .ambient category (which won't interrupt music or other audio)
    await audioModeConfigured;

    const player = createAudioPlayer(source);

    // Listen for playback completion to release resources
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (!status.didJustFinish) {
            return;
        }

        subscription.remove();
        player.remove();
    });

    player.play();
};

function clearSoundAssetsCache() {}

export {SOUNDS, clearSoundAssetsCache};
export default withMinimalExecutionTime(playSound, 300);
