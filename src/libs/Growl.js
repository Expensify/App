import React from 'react';
import CONST from '../CONST';

export const growlRef = React.createRef();

/**
 * Show the growl notification
 *
 * @param {String|JSX.Element} body
 * @param {String} type
 * @param {Number} [duration]
*/
function show(body, type, duration = CONST.GROWL.DURATION) {
    growlRef.current.show(body, type, duration);
}

/**
 * Show error growl
 *
 * @param {String|JSX.Element} body
 * @param {Number} [duration]
 */
function error(body, duration = CONST.GROWL.DURATION) {
    show(body, CONST.GROWL.ERROR, duration);
}

/**
 * Show success growl
 *
 * @param {String|JSX.Element} body
 * @param {Number} [duration]
 */
function success(body, duration = CONST.GROWL.DURATION) {
    show(body, CONST.GROWL.SUCCESS, duration);
}

export default {
    show,
    error,
    success,
};
