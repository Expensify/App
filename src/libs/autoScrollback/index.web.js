/* autoScrollBack address Mobile Safari-specific issues when the user overscrolls the window while the keyboard is visible */

/* allows smooth scroll when programmatic scrolling */
import smoothscroll from 'smoothscroll-polyfill';
import Str from 'expensify-common/lib/str';

import getBrowser from '../getBrowser';

const init = () => {
    if (getBrowser() !== 'safari') {
        return;
    }
    const userAgent = navigator.userAgent.toLowerCase();

    if (Str.contains(userAgent, 'iphone os 1')) {
        const baseInnerHeight = window.innerHeight;

        /* minimum acceptable innerHeight, less than that, scroll back */
        let minimumInnerHeight = 0;

        const isIos15 = Str.contains(userAgent, 'iphone os 15_');

        switch (window.outerHeight) {
            case 926: { // iPhone 12/13 Pro Max
                minimumInnerHeight = 440;
                break;
            }
            case 896: {
                if (window.devicePixelRatio === 3) { //  iPhone 11 Pro Max
                    minimumInnerHeight = 425;
                } else { // iPhone 11
                    minimumInnerHeight = isIos15 ? 460 : 420;
                }
                break;
            }
            case 844: {
                if (window.devicePixelRatio === 3) { // iPhone 13 / iPhone 12/13 Pro
                    minimumInnerHeight = 370;
                } else { //  iPhone 12
                    minimumInnerHeight = 412;
                }
                break;
            }
            case 812: {
                if (window.devicePixelRatio === 3) { // iPhone 11 Pro / iPhone 12/13 Mini
                    minimumInnerHeight = 340;
                } else { //  iPhone 11
                    minimumInnerHeight = 420;
                }
                break;
            }
            default: {
                //
            }
        }

        if (!minimumInnerHeight) {
            return;
        }

        let isTouching = false;
        let timeout;
        smoothscroll.polyfill();

        const scrollBack = () => {
            window.requestAnimationFrame(() => {
                window.scrollTo({
                    top: baseInnerHeight - minimumInnerHeight,
                    behavior: 'smooth',
                });
            });
        };

        const clearTimeoutIfNeeded = () => {
            if (!timeout) {
                return;
            }
            clearTimeout(timeout);
            timeout = undefined;
        };

        const scheduleScrollback = () => {
            clearTimeoutIfNeeded();
            if (!isTouching && minimumInnerHeight > window.innerHeight) {
                timeout = setTimeout(scrollBack, 34);
            }
        };

        document.addEventListener('touchstart', () => {
            isTouching = true;
        });
        document.addEventListener('touchend', () => {
            isTouching = false;
            scheduleScrollback();
        });
        document.addEventListener('scroll', () => {
            scheduleScrollback();
        });
    }
};

init();
