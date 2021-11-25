/* autoScrollBack address Mobile Safari-specific issues when the user overscrolls the window while the keyboard is visible */
import Str from 'expensify-common/lib/str';

import getBrowser from '../getBrowser';

const init = () => {
    if (getBrowser() !== 'safari') {
        return;
    }
    const userAgent = navigator.userAgent.toLowerCase();

    if (Str.contains(userAgent, 'iphone os 1')) {
        const innterHeightWithoutKeyboard = window.innerHeight;

        let waitingForScrollAfterFocus = false;

        let maxScrollY = 0;

        const isIos15 = Str.contains(userAgent, 'iphone os 15_');

        let isTouching = false;

        const scrollback = () => {
            if (!maxScrollY) {
                return;
            }
            if (!isTouching && window.scrollY > maxScrollY) {
                window.scrollTo({top: maxScrollY, behavior: 'smooth'});
            }
        };

        document.addEventListener('touchstart', () => {
            isTouching = true;
        });
        document.addEventListener('touchend', () => {
            isTouching = false;
            scrollback();
        });
        document.addEventListener('scroll', () => {
            if (waitingForScrollAfterFocus && !maxScrollY) {
                waitingForScrollAfterFocus = false;
                const keyboardHeight = innterHeightWithoutKeyboard - window.visualViewport.height;
                maxScrollY = keyboardHeight + (isIos15 ? 52 : 0);
            }
            scrollback();
        });
        document.addEventListener('focusin', () => {
            waitingForScrollAfterFocus = true;
        });
        document.addEventListener('focusout', () => {
            waitingForScrollAfterFocus = false;
        });
    }
};

init();
