import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import {DownArrow} from '../Icon/Expensicons';

const propTypes = {
    /** A callback method that is called when the value changes and it received the selected value as an argument */
    onChange: PropTypes.func.isRequired,

    /** Whether or not to show the disabled styles */
    useDisabledStyles: PropTypes.bool,

    /** Disables interaction with the component */
    disabled: PropTypes.bool,

    /** The items to display in the list of selections */
    items: PropTypes.arrayOf(PropTypes.shape({
        /** The value of the item that is being selected */
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

        /** The text to display for the item */
        label: PropTypes.string.isRequired,
    })).isRequired,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** The value that needs to be selected */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** An icon to display with the picker */
    icon: PropTypes.func,
};
const defaultProps = {
    useDisabledStyles: false,
    disabled: false,
    placeholder: {},
    value: null,
    icon: () => <Icon src={DownArrow} />,
};

export {
    propTypes,
    defaultProps,
};
