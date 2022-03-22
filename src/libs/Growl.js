import React from 'react';
import CONST from '../CONST';

const growlRef = React.createRef();

/**
 * Show the growl notification. If the ref is not available, retry until it is.
 *
 * @param {String} bodyText
 * @param {String} type
 * @param {Number} [duration]
*/
function show(bodyText, type, duration = CONST.GROWL.DURATION) {
    if (!growlRef.current) {
        setTimeout(() => show(bodyText, type, duration), 100);
        return;
    }
    growlRef.current.show(bodyText, type, duration);
}

/**
 * Show error growl
 *
 * @param {String} bodyText
 * @param {Number} [duration]
 */
function error(bodyText, duration = CONST.GROWL.DURATION) {
    show(bodyText, CONST.GROWL.ERROR, duration);
}

/**
 * Show success growl
 *
 * @param {String} bodyText
 * @param {Number} [duration]
 */
function success(bodyText, duration = CONST.GROWL.DURATION) {
    show(bodyText, CONST.GROWL.SUCCESS, duration);
}

export default {
    show,
    error,
    success,
};

export {
    growlRef,
};
