import {createAudioPlayer, setAudioModeAsync} from 'expo-audio';
import type {AudioSource} from 'expo-audio';
import {AppState} from 'react-native';
import type {ValueOf} from 'type-fest';

import attentionSound from '@assets/sounds/attention.mp3';
import doneSound from '@assets/sounds/done.mp3';
import receiveSound from '@assets/sounds/receive.mp3';
import successSound from '@assets/sounds/success.mp3';
import Log from '@libs/Log';

import {getIsMuted, SOUNDS, withMinimalExecutionTime} from './BaseSound';

// Sound assets are statically imported for bundling.
const SOUND_ASSETS = {
    [SOUNDS.DONE]: doneSound,
    [SOUNDS.SUCCESS]: successSound,
    [SOUNDS.ATTENTION]: attentionSound,
    [SOUNDS.RECEIVE]: receiveSound,
} satisfies Record<ValueOf<typeof SOUNDS>, Extract<AudioSource, number | string>>;

// Configure audio mode for in-app notification sounds:
// - playsInSilentMode: false – respect the device's silent/mute switch (iOS)
// - shouldPlayInBackground: false – push notification sounds are played by the system
// - interruptionMode: 'mixWithOthers' – don't interrupt other audio (e.g. music)
const audioModeConfigured = setAudioModeAsync({playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers'});

const playSound = async (soundFile: ValueOf<typeof SOUNDS>) => {
    if (getIsMuted() || AppState.currentState !== 'active') {
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

    try {
        player.play();
    } catch (error) {
        Log.warn('Failed to play sound', {error, soundFile});
        subscription.remove();
        player.remove();
    }
};

function clearSoundAssetsCache() {}

export {SOUNDS, clearSoundAssetsCache};
export default withMinimalExecutionTime(playSound, 300);
