import {useFocusEffect} from '@react-navigation/native';
<<<<<<< HEAD
import {useCallback, useEffect, useRef, useState} from 'react';
=======
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
>>>>>>> 1149ca7 (Merge pull request #31063 from tienifr/fix/30976)
import CONST from '@src/CONST';

export default function useAutoFocusInput() {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current) {
            return;
        }
<<<<<<< HEAD
        inputRef.current.focus();
        setIsScreenTransitionEnded(false);
    }, [isScreenTransitionEnded, isInputInitialized]);
=======
        InteractionManager.runAfterInteractions(() => {
            inputRef.current.focus();
            setIsScreenTransitionEnded(false);
        });
    }, [isScreenTransitionEnded, isInputInitialized, isSplashHidden]);
>>>>>>> 1149ca7 (Merge pull request #31063 from tienifr/fix/30976)

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []),
    );

    const inputCallbackRef = (ref) => {
        inputRef.current = ref;
        setIsInputInitialized(true);
    };

    return {inputCallbackRef};
}
