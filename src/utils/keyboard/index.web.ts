import {isMobile, isMobileSafari} from '@libs/Browser';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

import {Keyboard} from 'react-native';

import type {DismissKeyboardOptions} from './types';

type Orientation = 'portrait' | 'landscape';

let isVisible = false;

/** Tallest viewport height seen per orientation, i.e. the height without the keyboard. */
const viewportHeightsWithoutKeyboard: Partial<Record<Orientation, number>> = {};

/** Based on the width, which the keyboard doesn't change. */
function getOrientation(): Orientation {
    const {width, height} = window.screen;
    const distanceToLongSide = Math.abs(window.innerWidth - Math.max(width, height));
    const distanceToShortSide = Math.abs(window.innerWidth - Math.min(width, height));
    return distanceToLongSide < distanceToShortSide ? 'landscape' : 'portrait';
}

/** Also records the height. Under 152px of difference can be a smart banner or offline indicator, not the keyboard. */
function isKeyboardVisibleAt(viewportHeight: number): boolean {
    const orientation = getOrientation();
    const heightWithoutKeyboard = Math.max(viewportHeightsWithoutKeyboard[orientation] ?? 0, viewportHeight);
    viewportHeightsWithoutKeyboard[orientation] = heightWithoutKeyboard;
    return heightWithoutKeyboard - viewportHeight > CONST.SMART_BANNER_HEIGHT;
}

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
