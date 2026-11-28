/**
 * Safari can change the window size without firing a `resize` event on the window. When a foldable iPhone is folded, the
 * last `resize` event still reports an intermediate height, and the final size arrives only as a visualViewport `resize`
 * event. Code that listens to the window, like the safe area provider, then keeps the intermediate size, e.g. a bottom
 * inset that leaves the tab bar and the composer floating above the bottom of the screen. This fires the missed event.
 */
import {isMobileSafari} from './Browser';

let lastWidth = 0;
let lastHeight = 0;

function rememberWindowSize() {
    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;
}

function dispatchMissedResizeEvent() {
    const visualViewport = window.visualViewport;

    // When the soft keyboard opens, the visual viewport shrinks and Safari scrolls the page to reveal the focused input.
    // The window size changes then too, but listeners would measure the scrolled page, e.g. the safe area provider would
    // read the scroll offset as a top inset.
    if (!visualViewport || window.scrollY !== 0 || Math.round(visualViewport.height) < document.documentElement.clientHeight) {
        return;
    }

    if (window.innerWidth === lastWidth && window.innerHeight === lastHeight) {
        return;
    }

    window.dispatchEvent(new Event('resize'));
}

function startDispatchingMissedResizeEvents() {
    if (!isMobileSafari()) {
        return;
    }

    rememberWindowSize();
    window.addEventListener('resize', rememberWindowSize);
    window.visualViewport?.addEventListener('resize', dispatchMissedResizeEvent);
}

export default startDispatchingMissedResizeEvents;
