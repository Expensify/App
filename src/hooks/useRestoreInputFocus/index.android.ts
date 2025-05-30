import {useEffect, useRef} from 'react';
import {InteractionManager, Keyboard} from 'react-native';
import {KeyboardController} from 'react-native-keyboard-controller';

const useRestoreInputFocus = (isLostFocus: boolean) => {
    const keyboardVisibleBeforeLoosingFocusRef = useRef(false);

    useEffect(() => {
        if (isLostFocus) {
            keyboardVisibleBeforeLoosingFocusRef.current = Keyboard.isVisible();
        }

        if (!isLostFocus && keyboardVisibleBeforeLoosingFocusRef.current) {
            InteractionManager.runAfterInteractions(() => {
                KeyboardController.setFocusTo('current');
            });
        }
    }, [isLostFocus]);
};

export default useRestoreInputFocus;
