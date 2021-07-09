import React from 'react';
import CONST from '../CONST';

export const growlRef = React.createRef();

/**
 * Show the growl notification
 *
 * @param {String|JSX.Element} body
 * @param {String} type
 * @param {Number} [duration]
 * @param {Object} additionalProps
*/
function show(body, type, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    growlRef.current.show(body, type, duration, additionalProps);
}

/**
 * Show error growl
 *
 * @param {String|JSX.Element} body
 * @param {Number} [duration]
 * @param {Object} additionalProps
 */
function error(body, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    show(body, CONST.GROWL.ERROR, duration, additionalProps);
}

/**
 * Show success growl
 *
 * @param {String|JSX.Element} body
 * @param {Number} [duration]
 * @param {Object} additionalProps
 */
function success(body, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    show(body, CONST.GROWL.SUCCESS, duration, additionalProps);
}

export default {
    show,
    error,
    success,
};
