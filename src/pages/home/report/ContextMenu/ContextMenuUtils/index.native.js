/* eslint-disable import/prefer-default-export */

import _ from 'lodash';

/**
 * Always show popover description on native platforms
 *
 * @param {Object} selection
 * @returns {String}
 */
function getPopoverDescription(selection) {
    return _.get(selection, 'text', '');
}

export {
    getPopoverDescription,
};
