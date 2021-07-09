import React from 'react';
import CONST from '../CONST';

export const growlRef = React.createRef();

/**
 * Show the growl notification
 *
 * @param {String} body - The text or name of the template you'd like to display in the growl body.
 * @param {String} type
 * @param {Number} [duration]
 * @param {Object} [additionalProps] - Any additional props passed to the growl notification template.
*/
function show(body, type, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    growlRef.current.show(body, type, duration, additionalProps);
}

/**
 * Show error growl
 *
 * @param {String} body - The text or name of the template you'd like to display in the growl body.
 * @param {Number} [duration]
 * @param {Object} [additionalProps] - Any additional props passed to the growl notification template.
 */
function error(body, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    show(body, CONST.GROWL.ERROR, duration, additionalProps);
}

/**
 * Show success growl
 *
 * @param {String} body - The text or name of the template you'd like to display in the growl body.
 * @param {Number} [duration]
 * @param {Object} [additionalProps] - Any additional props passed to the growl notification template.
 */
function success(body, duration = CONST.GROWL.DURATION, additionalProps = {}) {
    show(body, CONST.GROWL.SUCCESS, duration, additionalProps);
}

export default {
    show,
    error,
    success,
};
