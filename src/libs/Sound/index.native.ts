import Sound from 'react-native-sound';
import type {ValueOf} from 'type-fest';
import {getIsMuted, SOUNDS, withMinimalExecutionTime} from './BaseSound';
import config from './config';

const playSound = (soundFile: ValueOf<typeof SOUNDS>) => {
    const sound = new Sound(`${config.prefix}${soundFile}.mp3`, Sound.MAIN_BUNDLE, (error) => {
        if (error || getIsMuted()) {
            return;
        }

        sound.play();
    });
};

function clearSoundAssetsCache() {}

export {SOUNDS, clearSoundAssetsCache};
export default withMinimalExecutionTime(playSound, 300);
