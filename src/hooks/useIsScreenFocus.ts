import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';

export default function useIsScreenFocusedRef() {
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setIsScreenFocused(true);
            return () => {
                setIsScreenFocused(false);
            };
        }, []),
    );

    return isScreenFocused;
}
