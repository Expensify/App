/* The autoScrollBack address Mobile Safari-specific issues when the user overscrolls the window while the keyboard is visible */
import Str from 'expensify-common/lib/str';
import smoothscrollPolyfill from 'smoothscroll-polyfill';
import CONST from '../../CONST';
import * as Browser from '../Browser/Browser';

const userAgent = navigator.userAgent.toLowerCase();

// The innerHeight when the keyboard is not visible
const baseInnerHeight = window.innerHeight;

// Control flag if an input/text area was focused and we're waiting the "focus scroll" to identify the screen size
let isWaitingForScroll = false;

// Calculated value of the maximum value to the screen to scroll when keyboard is visible
let maxScrollY = 0;

let isTouching = false;

let scrollbackTimeout;

const isIOS15 = Str.contains(userAgent, 'iphone os 15_');

function scrollback() {
    if (isTouching || maxScrollY >= window.scrollY) {
        return;
    }
    window.scrollTo({top: maxScrollY, behavior: 'smooth'});
}

function scheduleScrollback() {
    if (!maxScrollY) {
        return;
    }

    if (scrollbackTimeout) {
        clearTimeout(scrollbackTimeout);
        scrollbackTimeout = undefined;
    }

    if (!isTouching && window.scrollY > maxScrollY) {
        scrollbackTimeout = setTimeout(scrollback, 34);
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
        maxScrollY = keyboardHeight + (isIOS15 ? 52 : 0);
    }

    scheduleScrollback();
}

function startWaitingForScroll() {
    isWaitingForScroll = true;
}

function stopWaitingForScroll() {
    isWaitingForScroll = false;
}

export default function () {
    if (!Browser.getBrowser() === CONST.BROWSER.SAFARI || !Str.contains(userAgent, 'iphone os 1')) {
        return;
    }
    smoothscrollPolyfill.polyfill();
    document.addEventListener('touchstart', touchStarted);
    document.addEventListener('touchend', scrollbackAfterTouch);
    document.addEventListener('scroll', scrollbackAfterScroll);
    document.addEventListener('focusin', startWaitingForScroll);
    document.addEventListener('focusout', stopWaitingForScroll);
}
