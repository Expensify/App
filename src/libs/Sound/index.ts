import {Platform} from 'react-native';
import Onyx from 'react-native-onyx';
import Sound from 'react-native-sound';
import ONYXKEYS from '@src/ONYXKEYS';

const prefix = Platform.select({
    web: '/sounds/',
    default: '',
});

let isMuted = false;
// eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: (val) => (isMuted = !!val?.isMutedAllSounds),
});

const playSound = (soundFile: string) => {
    const sound = new Sound(`${prefix}${soundFile}.mp3`, Sound.MAIN_BUNDLE, (error) => {
        if (error || isMuted) {
            return;
        }

        sound.play();
    });
};

export default playSound;
