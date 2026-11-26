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
    /** How long the growl stays on screen. `Infinity` keeps it until the user dismisses it or `Growl.hide()` is called with its nonce. */
    duration?: number;
    action?: GrowlAction;

    /** Position where the growl is anchored */
    position?: GrowlPosition;

    /** Replaces the icon of the growl with a loading spinner, for work that is still in progress */
    shouldShowSpinner?: boolean;
};

type GrowlShowOptions = GrowlOptions & {
    type: GrowlType;
};

type GrowlRef = {
    /** Shows the growl and returns its nonce, which identifies this growl for `hide` */
    show?: (options: GrowlShowOptions & {duration: number}) => number;

    /** Slides the growl with this nonce out, if it is the one shown */
    hide?: (nonce: number) => void;
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
 * @returns the nonce of the growl, to pass to `hide`. It resolves once the growl is shown, and to undefined if there is no growl to show it.
 */
function show({bodyText, type, duration, action, position, shouldShowSpinner}: GrowlShowOptions): Promise<number | undefined> {
    // Default to a longer duration when there's an action button so users have time to tap it.
    const resolvedDuration = duration ?? (action ? CONST.GROWL.DURATION_WITH_ACTION : CONST.GROWL.DURATION);
    return isReadyPromise.then(() => growlRef.current?.show?.({bodyText, type, duration: resolvedDuration, action, position, shouldShowSpinner}));
}

/**
 * Hide the growl with this nonce (resolved by show, error and success). Does nothing if it is not the shown growl any more.
 * Meant for growls shown with `duration: Infinity`, which never go away on their own.
 */
function hide(nonce: number) {
    growlRef.current?.hide?.(nonce);
}

/**
 * Show error growl.
 */
function error(options: GrowlOptions) {
    return show({...options, type: CONST.GROWL.ERROR});
}

/**
 * Show success growl
 */
function success(options: GrowlOptions) {
    return show({...options, type: CONST.GROWL.SUCCESS});
}

export default {
    show,
    error,
    success,
    hide,
};

export type {GrowlRef, GrowlAction, GrowlPosition, GrowlType};

export {growlRef, setIsReady};
