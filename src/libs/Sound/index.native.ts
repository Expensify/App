import {createAudioPlayer} from 'expo-audio';
import type {AudioSource} from 'expo-audio';
import type {ValueOf} from 'type-fest';
import {getIsMuted, SOUNDS, withMinimalExecutionTime} from './BaseSound';

const SOUND_ASSETS: Record<ValueOf<typeof SOUNDS>, AudioSource> = {
    [SOUNDS.DONE]: require('@assets/sounds/done.mp3') as AudioSource,
    [SOUNDS.SUCCESS]: require('@assets/sounds/success.mp3') as AudioSource,
    [SOUNDS.ATTENTION]: require('@assets/sounds/attention.mp3') as AudioSource,
    [SOUNDS.RECEIVE]: require('@assets/sounds/receive.mp3') as AudioSource,
};

// Single player instance
let player: ReturnType<typeof createAudioPlayer> | null = null;

function playSound(soundFile: ValueOf<typeof SOUNDS>) {
    if (getIsMuted()) {
        return;
    }

    const source = SOUND_ASSETS[soundFile];
    if (!source) {
        return;
    }

    if (!player) {
        player = createAudioPlayer(source);
    } else {
        player.replace(source);
    }

    player.play();
}

function clearSoundAssetsCache() {}

export {SOUNDS, clearSoundAssetsCache};
export default withMinimalExecutionTime(playSound, 300);
