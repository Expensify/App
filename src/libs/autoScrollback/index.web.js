import smoothscroll from 'smoothscroll-polyfill';

import getBrowser from '../getBrowser';

const init = () => {
    if (getBrowser() === 'safari') {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('iphone')) {
            let top = 0;
            let innerHeightTooSmall = 0;

            if (userAgent.indexOf('iphone os 15_') > 0) { // iOS 15
                if (window.outerHeight === 812) { // iPhone Pro
                    top = 280;
                    innerHeightTooSmall = 350;
                } else if (window.outerHeight === 896) {
                    if (window.devicePixelRatio === 3) { //  iPhone Pro Max
                        top = 290;
                        innerHeightTooSmall = 425;
                    } else { //  iPhone
                        top = 245;
                        innerHeightTooSmall = 470;
                    }
                }
            } else if (userAgent.indexOf('iphone os 1') > 0) { // iOS Before 15
                if (window.outerHeight === 812) { // iPhone Pro
                    top = 280;
                    innerHeightTooSmall = 350;
                } else if (window.outerHeight === 896) {
                    if (window.devicePixelRatio === 3) { //  iPhone Pro Max
                        top = 290;
                        innerHeightTooSmall = 425;
                    } else { //  iPhone
                        top = 300;
                        innerHeightTooSmall = 420;
                    }
                }
            }

            if (!top || !innerHeightTooSmall) {
                return;
            }

            // const innerHeightTooSmall = 470;
            let isTouching = false;
            let timeout;
            smoothscroll.polyfill();

            const scrollBack = () => {
                window.requestAnimationFrame(() => {
                    window.scrollTo({
                        top,
                        behavior: 'smooth',
                    });
                });
            };

            const clearTimeoutIfNeeded = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = undefined;
                }
            };

            const scheduleScrollback = () => {
                clearTimeoutIfNeeded();

                if (!isTouching && innerHeightTooSmall > window.innerHeight) {
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
    }
};

init();
