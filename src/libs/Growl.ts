import React from 'react';
import CONST from '@src/CONST';

type GrowlAction = {
    label: string;
    onPress: () => void;
};

/** The set of growl variants the notification UI knows how to render. */
type GrowlType = typeof CONST.GROWL.SUCCESS | typeof CONST.GROWL.ERROR | typeof CONST.GROWL.WARNING | typeof CONST.GROWL.LOADING;

type GrowlRef = {
    show?: (bodyText: string, type: GrowlType, duration: number, action?: GrowlAction) => void;
};

const growlRef = React.createRef<GrowlRef>();
let resolveIsReadyPromise: undefined | ((value?: unknown) => void);
const isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

function setIsReady() {
    if (!resolveIsReadyPromise) {
        return;
    }
    resolveIsReadyPromise();
}

/**
 * Show the growl notification
 */
function show(bodyText: string, type: GrowlType, duration?: number, action?: GrowlAction) {
    // Default to a longer duration when there's an action button so users have time to tap it.
    const resolvedDuration = duration ?? (action ? CONST.GROWL.DURATION_WITH_ACTION : CONST.GROWL.DURATION);
    isReadyPromise.then(() => {
        if (!growlRef?.current?.show) {
            return;
        }
        growlRef.current.show(bodyText, type, resolvedDuration, action);
    });
}

/**
 * Show error growl
 */
function error(bodyText: string, duration?: number, action?: GrowlAction) {
    show(bodyText, CONST.GROWL.ERROR, duration, action);
}

/**
 * Show success growl
 */
function success(bodyText: string, duration?: number, action?: GrowlAction) {
    show(bodyText, CONST.GROWL.SUCCESS, duration, action);
}

/**
 * Show indefinite loading growl (no auto-dismiss). Call success/error/show again to replace it.
 */
function loading(bodyText: string) {
    show(bodyText, CONST.GROWL.LOADING, CONST.GROWL.DURATION_INDEFINITE);
}

export default {
    show,
    error,
    success,
    loading,
};

export type {GrowlRef, GrowlAction, GrowlType};

export {growlRef, setIsReady};
