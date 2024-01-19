import {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import Sound from 'react-native-sound';

const prefix = Platform.select({
    web: '/sounds/',
    default: '',
});

const usePlaySound = (soundFile: string) => {
    const [sound, setSound] = useState<Sound>();

    useEffect(() => {
        const ringtone = new Sound(`${prefix}${soundFile}.mp3`, Sound.MAIN_BUNDLE);

        setSound(ringtone);
    }, [soundFile]);

    const play = useCallback(() => {
        sound?.play();
    }, [sound]);

    return {
        play,
    };
};

export default usePlaySound;
