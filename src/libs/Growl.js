import React from 'react';

export const growlRef = React.createRef();

/**
 * Show the growl notification
 *
 * @param {String} bodyText
 * @param {String} type
 * @param {Number} duration
*/
function show(bodyText, type, duration) {
    growlRef.current.show(bodyText, type, duration);
}


export default {show};
