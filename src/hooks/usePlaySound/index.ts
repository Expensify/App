import {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import Onyx from 'react-native-onyx';
import Sound from 'react-native-sound';
import ONYXKEYS from '@src/ONYXKEYS';

const prefix = Platform.select({
    web: '/sounds/',
    default: '',
});

const usePlaySound = (soundFile: string) => {
    const [isMuted, setMuted] = useState(false);
    const [sound, setSound] = useState<Sound>();

    useEffect(() => {
        const ringtone = new Sound(`${prefix}${soundFile}.mp3`, Sound.MAIN_BUNDLE);

        setSound(ringtone);
    }, [soundFile]);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connectionID = Onyx.connect({
            key: ONYXKEYS.USER,
            callback: (val) => setMuted(!!val?.isMutedAllSounds),
        });

        return () => {
            Onyx.disconnect(connectionID);
        };
    }, []);

    const play = useCallback(() => {
        if (isMuted) {
            return;
        }

        sound?.play();
    }, [sound, isMuted]);

    return {play};
};

export default usePlaySound;
