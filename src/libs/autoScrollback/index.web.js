/* The autoScrollBack address Mobile Safari-specific issues when the user overscrolls the window while the keyboard is visible */
import Str from 'expensify-common/lib/str';
import CONST from '../../CONST';
import getBrowser from '../getBrowser';

const userAgent = navigator.userAgent.toLowerCase();

// The innerHeight when the keyboard is not visible
const baseInnerHeight = window.innerHeight;

// Control flag if an input/text area was focused and we're waiting the "focus scroll" to identify the screen size
let isWaitingForScroll = false;

// Calculated value of the maximum value to the screen to scroll when keyboard is visible
let maxScrollY = 0;

let isTouching = false;

const isIos15 = Str.contains(userAgent, 'iphone os 15_');

function scrollback() {
    if (!maxScrollY) {
        return;
    }
    if (!isTouching && window.scrollY > maxScrollY) {
        window.scrollTo({top: maxScrollY, behavior: 'smooth'});
    }
}

function touchStarted() {
    isTouching = true;
}

function scrollbackAfterTouch() {
    isTouching = false;
    scrollback();
}

function scrollbackAfterScroll() {
    if (isWaitingForScroll && !maxScrollY) {
        isWaitingForScroll = false;
        const keyboardHeight = baseInnerHeight - window.visualViewport.height;

        // The iOS 15 Safari has a 52 pixel tall address label that must be manually added
        maxScrollY = keyboardHeight + (isIos15 ? 52 : 0);
    }
    scrollback();
}

function startsWaitingForScroll() {
    isWaitingForScroll = true;
}

function stopsWaitingForScroll() {
    isWaitingForScroll = false;
}

if (getBrowser() === CONST.BROWSER.SAFARI && Str.contains(userAgent, 'iphone os 1')) {
    document.addEventListener('touchstart', touchStarted);
    document.addEventListener('touchend', scrollbackAfterTouch);
    document.addEventListener('scroll', scrollbackAfterScroll);
    document.addEventListener('focusin', startsWaitingForScroll);
    document.addEventListener('focusout', stopsWaitingForScroll);
}
