import React from 'react';
import PropTypes from 'prop-types';
import {Armchair} from './Icon/Expensicons';
import variables from '../styles/variables';

const propTypes = {
    /** The name of the icon to render. */
    icon: PropTypes.string.isRequired,
};

/**
 * Get an icon based on the name provided
 * @param {String} iconName
 * @returns {Function}
 */
function getIconFromName(iconName) {
    switch (iconName) {
        case 'armchair':
        default:
            return Armchair;
    }
}

const IconAvatar = (props) => {
    // PascalCase is required for React components, so capitalize the const here
    const Icon = getIconFromName(props.icon);
    return (<Icon width={variables.componentSizeNormal} height={variables.componentSizeNormal} />);
};

IconAvatar.displayName = 'IconAvatar';
IconAvatar.propTypes = propTypes;
export default IconAvatar;
