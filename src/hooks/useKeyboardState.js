import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

/**
 * Hook for getting current state of keyboard
 * whether or not the keyboard is open
 * @returns {Object}
 */
export default function useKeyboardState() {
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardShown(true));
        return keyboardDidShowListener.remove;
    }, []);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShown(false));
        return keyboardDidHideListener.remove;
    }, []);

    return {isKeyboardShown};
}
