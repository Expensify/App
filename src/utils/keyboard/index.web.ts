import {isMobile, isMobileSafari} from '@libs/Browser';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

import {Keyboard} from 'react-native';

import type {DismissKeyboardOptions} from './types';

type ViewportHeightSample = {
    /** Tallest viewport height seen at the width. */
    height: number;

    /** Whether the keyboard was open at that height, i.e. the height without the keyboard isn't known yet. */
    isKeyboardOpen: boolean;
};

let isVisible = false;

// Kept per window width, which the keyboard doesn't change. Comparing a landscape height against the portrait one would
// read the shorter landscape viewport as an open keyboard, and dismiss() would then wait forever for it to close. Keying
// by the width rather than by orientation also keeps rotations apart in split or resized windows, where both widths are
// closer to the same side of the screen.
const viewportHeightSamples = new Map<number, ViewportHeightSample>();

/** Also records the height. Under 152px of difference can be a smart banner or offline indicator, not the keyboard. */
function isKeyboardVisibleAt(viewportHeight: number): boolean {
    const width = window.innerWidth;
    const sample = viewportHeightSamples.get(width);

    // The keyboard stays open through a rotation, so the first height at a new width can be reduced by it
    if (!sample) {
        viewportHeightSamples.set(width, {height: viewportHeight, isKeyboardOpen: isVisible});
        return isVisible;
    }

    // Grown by more than a banner, so the sampled height was taken with the keyboard open and this one is without it
    if (viewportHeight - sample.height > CONST.SMART_BANNER_HEIGHT) {
        viewportHeightSamples.set(width, {height: viewportHeight, isKeyboardOpen: false});
        return false;
    }

    // The keyboard opened, so it was closed at the sampled height after all
    if (sample.height - viewportHeight > CONST.SMART_BANNER_HEIGHT) {
        sample.isKeyboardOpen = false;
        return true;
    }

    sample.height = Math.max(sample.height, viewportHeight);
    return sample.isKeyboardOpen;
}

// The app loads with the keyboard closed, so the load-time height is the baseline for its width.
const initialViewportHeight = window?.visualViewport?.height;
if (initialViewportHeight) {
    isKeyboardVisibleAt(initialViewportHeight);
}

const keyboardVisibilityChangeListenersSet = new Set<(isVisible: boolean) => void>();

const subscribeKeyboardVisibilityChange = (cb: (isVisible: boolean) => void) => {
    keyboardVisibilityChangeListenersSet.add(cb);

    return () => {
        keyboardVisibilityChangeListenersSet.delete(cb);
    };
};

const handleResize = () => {
    const viewportHeight = window?.visualViewport?.height;

    if (!viewportHeight) {
        return;
    }

    isVisible = isKeyboardVisibleAt(viewportHeight);

    for (const cb of keyboardVisibilityChangeListenersSet) {
        cb(isVisible);
    }
};

window.visualViewport?.addEventListener('resize', handleResize);

const dismiss = (options?: DismissKeyboardOptions): Promise<void> => {
    return new Promise((resolve) => {
        const shouldSkipSafari = options?.shouldSkipSafari && isMobileSafari();
        const shouldDismiss = !isVisible || !isMobile();

        if (shouldDismiss || shouldSkipSafari) {
            options?.afterTransition?.();
            resolve();
            return;
        }

        const transitionHandle = TransitionTracker.startTransition();

        const handleDismissResize = () => {
            const viewportHeight = window?.visualViewport?.height;

            if (!viewportHeight) {
                return;
            }

            if (isKeyboardVisibleAt(viewportHeight)) {
                return;
            }

            window.visualViewport?.removeEventListener('resize', handleDismissResize);
            TransitionTracker.endTransition(transitionHandle);
            return resolve();
        };

        window.visualViewport?.addEventListener('resize', handleDismissResize);
        Keyboard.dismiss();

        if (options?.afterTransition) {
            TransitionTracker.runAfterTransitions({callback: options.afterTransition});
        }
    });
};

const dismissKeyboardAndExecute = (cb: () => void): Promise<void> => {
    // This fixes a bug specific to native apps on Android < 16
    // For web it just executes callback
    // https://github.com/Expensify/App/issues/70692
    if (isMobileSafari()) {
        return dismiss().then(cb);
    }
    return Promise.resolve().then(cb);
};

const utils = {dismiss, dismissKeyboardAndExecute, subscribeKeyboardVisibilityChange};

export default utils;
