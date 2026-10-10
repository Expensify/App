import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

type GrowlAction = {
    label: string;
    onPress: () => void;
};

/** The set of growl variants the notification UI knows how to render. */
type GrowlType = typeof CONST.GROWL.SUCCESS | typeof CONST.GROWL.ERROR | typeof CONST.GROWL.WARNING;

/** Wide-screen anchor. Narrow layouts keep the top anchor. */
type GrowlPosition = ValueOf<typeof CONST.GROWL.POSITION>;

type GrowlOptions = {
    duration?: number;
    action?: GrowlAction;
    position?: GrowlPosition;
};

type GrowlRef = {
    show?: (bodyText: string, type: GrowlType, duration: number, action?: GrowlAction, position?: GrowlPosition) => void;
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
function show(bodyText: string, type: GrowlType, duration?: number, action?: GrowlAction, position?: GrowlPosition) {
    // Default to a longer duration when there's an action button so users have time to tap it.
    const resolvedDuration = duration ?? (action ? CONST.GROWL.DURATION_WITH_ACTION : CONST.GROWL.DURATION);
    isReadyPromise.then(() => {
        if (!growlRef?.current?.show) {
            return;
        }
        growlRef.current.show(bodyText, type, resolvedDuration, action, position);
    });
}

function isGrowlOptions(value: number | GrowlOptions | undefined): value is GrowlOptions {
    return typeof value === 'object' && value !== null;
}

/**
 * Show error growl.
 * The second argument stays a duration for existing callers, or an options object when the anchor must be set.
 */
function error(bodyText: string, durationOrOptions?: number | GrowlOptions, action?: GrowlAction) {
    if (isGrowlOptions(durationOrOptions)) {
        show(bodyText, CONST.GROWL.ERROR, durationOrOptions.duration, durationOrOptions.action, durationOrOptions.position);
        return;
    }
    show(bodyText, CONST.GROWL.ERROR, durationOrOptions, action);
}

/**
 * Show success growl
 */
function success(bodyText: string, duration?: number, action?: GrowlAction) {
    show(bodyText, CONST.GROWL.SUCCESS, duration, action);
}

export default {
    show,
    error,
    success,
};

export type {GrowlRef, GrowlAction, GrowlType, GrowlPosition};

export {growlRef, setIsReady};
