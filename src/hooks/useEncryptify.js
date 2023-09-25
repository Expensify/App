import {useEffect, useState} from 'react';
import EncryptifyModule, {initializationPromise} from 'react-native-encryptify';

const useEncryptify = () => {
    const [Encryptify, setEncryptify] = useState(EncryptifyModule);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initializationPromise.then((instance) => {
            setEncryptify(instance);
            setReady(true);
        });
    }, []);

    return {Encryptify, isEncryptifyReady: ready};
};

export default useEncryptify;
