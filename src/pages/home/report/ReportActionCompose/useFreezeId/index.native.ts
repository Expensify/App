import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';

const useFreezeId = () => {
    const [uniqueRenderId, setUniqueRenderId] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setUniqueRenderId((c) => c + 1);
        }, []),
    );

    return uniqueRenderId;
};

export default useFreezeId;
