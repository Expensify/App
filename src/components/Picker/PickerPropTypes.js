import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import styles from '../../styles/styles';
import {DownArrow} from '../Icon/Expensicons';

const propTypes = {
    /** A callback method that is called when the value changes and it received the selected value as an argument */
    onChange: PropTypes.func.isRequired,

    /** Whether or not to show the disabled styles */
    isDisabled: PropTypes.bool,

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

    /** Size of a picker component */
    size: PropTypes.oneOf(['normal', 'small']),
};
const defaultProps = {
    isDisabled: false,
    disabled: false,
    placeholder: {},
    value: null,
    icon: size => (
        <>
            {size === 'small'
                ? (
                    <Icon
                        width={styles.pickerSmall.icon.width}
                        height={styles.pickerSmall.icon.height}
                        src={DownArrow}
                    />
                )
                : (
                    <Icon
                        src={DownArrow}
                    />
                )}
        </>
    ),
    size: 'normal',
};

export {
    propTypes,
    defaultProps,
};
