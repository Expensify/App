import React from 'react';
import CONST from '@src/CONST';

type GrowlRef = {
    show?: (bodyText: string, type: string, duration: number) => void;
    hide?: () => void;
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
function show(bodyText: string, type: string, duration: number = CONST.GROWL.DURATION) {
    isReadyPromise.then(() => {
        if (!growlRef?.current?.show) {
            return;
        }
        growlRef.current.show(bodyText, type, duration);
    });
}

/**
 * Hide the growl notification
 */
function hide() {
    isReadyPromise.then(() => {
        if (!growlRef?.current?.hide) {
            return;
        }

        growlRef.current.hide();
    });
}

/**
 * Show error growl
 */
function error(bodyText: string, duration: number = CONST.GROWL.DURATION) {
    show(bodyText, CONST.GROWL.ERROR, duration);
}

/**
 * Show success growl
 */
function success(bodyText: string, duration: number = CONST.GROWL.DURATION) {
    show(bodyText, CONST.GROWL.SUCCESS, duration);
}

export default {
    show,
    hide,
    error,
    success,
};

export type {GrowlRef};

export {growlRef, setIsReady};
