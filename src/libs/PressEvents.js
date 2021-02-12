import lodashGet from 'lodash.get';

/**
 * Is this press event a right click on a mouse?
 *
 * @param {Object} pressEvent
 * @returns {Boolean}
 */
function isRightClick(pressEvent) {
    return lodashGet(pressEvent, ['nativeEvent', 'which'], 0) === 3;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isRightClick,
};
