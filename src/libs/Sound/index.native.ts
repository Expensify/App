import Onyx from 'react-native-onyx';
import Sound from 'react-native-sound';
import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import config from './config';
import { SOUNDS, isMuted, withMinimalExecutionTime } from './BaseSound'

const playSound = (soundFile: ValueOf<typeof SOUNDS>) => {
    const sound = new Sound(`${config.prefix}${soundFile}.mp3`, Sound.MAIN_BUNDLE, (error) => {
        if (error || isMuted) {
            return;
        }

        sound.play();
    });
};

export {SOUNDS};
export default withMinimalExecutionTime(playSound, 300);
