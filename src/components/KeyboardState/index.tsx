import React, {useEffect, useRef, useState} from 'react';
import type {ReactElement} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {BaseKeyboardStateProvider, KeyboardStateContext} from './BaseProvider';

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);
    const isKeyboardAnimatingRef = useRef(false);

    useEffect(() => {
        const handleViewportResize = () => {
            if (!window.visualViewport) {
                setKeyboardHeight(0);
                setIsKeyboardActive(false);
                return;
            }
            const viewportHeight = window.visualViewport.height;
            const windowHeight = window.innerHeight;
            const estimatedKeyboardHeight = windowHeight - viewportHeight;

            const shown = estimatedKeyboardHeight > 100;
            setKeyboardHeight(shown ? estimatedKeyboardHeight : 0);
            setIsKeyboardActive(shown);
        };

        const handleFocus = (event: FocusEvent) => {
            const target = event.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                setIsKeyboardActive(true);
                handleViewportResize();
            }
        };

        const handleBlur = (event: FocusEvent) => {
            const target = event.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'DIV'].includes(target.tagName)) {
                setIsKeyboardActive(false);
                setKeyboardHeight(0);
            }
        };

        window.visualViewport?.addEventListener('resize', handleViewportResize);
        document.addEventListener('focus', handleFocus, true);
        document.addEventListener('blur', handleBlur, true);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleViewportResize);
            document.removeEventListener('focus', handleFocus, true);
            document.removeEventListener('blur', handleBlur, true);
        };
    }, []);

    return (
        <BaseKeyboardStateProvider
            keyboardHeight={keyboardHeight}
            isKeyboardActive={isKeyboardActive}
            isKeyboardAnimatingRef={isKeyboardAnimatingRef}
        >
            {children}
        </BaseKeyboardStateProvider>
    );
}

export {KeyboardStateProvider, KeyboardStateContext};
