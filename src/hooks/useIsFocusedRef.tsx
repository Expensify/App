import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';

function useIsFocusedRef() {
    const isFocusedRef = useRef(true);

    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
            };
        }, []),
    );

    return isFocusedRef;
}

export default useIsFocusedRef;
