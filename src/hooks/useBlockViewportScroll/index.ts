import {useEffect, useRef} from 'react';
import Keyboard from '@libs/NativeWebKeyboard';

/**
 * A hook that blocks viewport scroll when the keyboard is visible.
 * It does this by capturing the current scrollY position when the keyboard is shown, then scrolls back to this position smoothly on 'touchend' event.
 * This scroll blocking is removed when the keyboard hides.
 * This hook is doing nothing on native platforms.
 *
 * @example
 * useBlockViewportScroll();
 */
function useBlockViewportScroll() {
    const optimalScrollY = useRef(0);
    const keyboardShowListenerRef = useRef(() => {});
    const keyboardHideListenerRef = useRef(() => {});

    useEffect(() => {
        const handleTouchEnd = () => {
            window.scrollTo({top: optimalScrollY.current, behavior: 'smooth'});
        };

        const handleKeybShow = () => {
            optimalScrollY.current = window.scrollY;
            window.addEventListener('touchend', handleTouchEnd);
        };

        const handleKeybHide = () => {
            window.removeEventListener('touchend', handleTouchEnd);
        };

        keyboardShowListenerRef.current = Keyboard.addListener('keyboardDidShow', handleKeybShow);
        keyboardHideListenerRef.current = Keyboard.addListener('keyboardDidHide', handleKeybHide);

        return () => {
            keyboardShowListenerRef.current();
            keyboardHideListenerRef.current();
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);
}

export default useBlockViewportScroll;
