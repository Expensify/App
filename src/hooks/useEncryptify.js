import {useEffect, useState} from 'react';
import EncryptifyModule, {initializationPromise} from 'react-native-encryptify';

const useEncryptify = () => {
    const [Encryptify, setEncryptify] = useState(EncryptifyModule);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initializationPromise.then(() => {
            setEncryptify(EncryptifyModule);
            setReady(true);
        });
    }, []);

    return {Encryptify, isEncryptifyReady: ready};
};

export default useEncryptify;
