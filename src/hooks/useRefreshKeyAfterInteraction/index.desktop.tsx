import {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';

function useRefreshKeyAfterInteraction(defaultValue: string) {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setCounter((prev) => prev + 1);
        });
    }, []);

    return `${defaultValue}-${counter}`;
}

export default useRefreshKeyAfterInteraction;
