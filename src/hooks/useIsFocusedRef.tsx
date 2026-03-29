import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useRef} from 'react';

function useIsFocusedRef() {
    const navigation = useNavigation();
    const isFocusedRef = useRef(navigation.isFocused());

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
