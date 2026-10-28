import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

type GrowlAction = {
    label: string;
    onPress: () => void;
};

/** The set of growl variants the notification UI knows how to render. */
type GrowlType = typeof CONST.GROWL.SUCCESS | typeof CONST.GROWL.ERROR | typeof CONST.GROWL.WARNING;
type GrowlPosition = ValueOf<typeof CONST.GROWL.POSITION>;

type GrowlOptions = {
    bodyText: string;
    duration?: number;
    action?: GrowlAction;

    /** Position where the growl is anchored */
    position?: GrowlPosition;
};

type GrowlShowOptions = GrowlOptions & {
    type: GrowlType;
};

type GrowlRef = {
    show?: (options: GrowlShowOptions & {duration: number}) => void;
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
function show({bodyText, type, duration, action, position}: GrowlShowOptions) {
    // Default to a longer duration when there's an action button so users have time to tap it.
    const resolvedDuration = duration ?? (action ? CONST.GROWL.DURATION_WITH_ACTION : CONST.GROWL.DURATION);
    isReadyPromise.then(() => {
        if (!growlRef?.current?.show) {
            return;
        }
        growlRef.current.show({bodyText, type, duration: resolvedDuration, action, position});
    });
}

/**
 * Show error growl.
 */
function error(options: GrowlOptions) {
    show({...options, type: CONST.GROWL.ERROR});
}

/**
 * Show success growl
 */
function success(options: GrowlOptions) {
    show({...options, type: CONST.GROWL.SUCCESS});
}

export default {
    show,
    error,
    success,
};

export type {GrowlRef, GrowlAction, GrowlPosition, GrowlType};

export {growlRef, setIsReady};
