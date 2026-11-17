import isEditableElement from '@libs/isEditableElement';

import {useEffect} from 'react';

/**
 * Android Chrome scrolls the focused input into view while the keyboard is still animating in, so in landscape the
 * input can end up partly outside the space that's left. This scrolls it fully into view once the viewport settles.
 */
function useRevealFocusedInputOnResize(isEnabled: boolean) {
    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        let frame: number | undefined;
        const reveal = () => {
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
            frame = requestAnimationFrame(() => {
                frame = undefined;
                const element = document.activeElement;
                if (!isEditableElement(element)) {
                    return;
                }
                const {top, bottom} = element.getBoundingClientRect();
                if (top >= 0 && bottom <= window.innerHeight) {
                    return;
                }
                element.scrollIntoView({block: 'nearest'});
            });
        };

        window.addEventListener('resize', reveal);
        return () => {
            window.removeEventListener('resize', reveal);
            if (frame === undefined) {
                return;
            }
            cancelAnimationFrame(frame);
        };
    }, [isEnabled]);
}

export default useRevealFocusedInputOnResize;
