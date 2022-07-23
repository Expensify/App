/* eslint-disable import/prefer-default-export */

import lodashGet from 'lodash/get';

/**
 * Always show popover description on native platforms
 *
 * @param {Object} selection
 * @returns {String}
 */
function getPopoverDescription(selection) {
    return lodashGet(selection, 'text', '');
}

export {
    getPopoverDescription,
};
