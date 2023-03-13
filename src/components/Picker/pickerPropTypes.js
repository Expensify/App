import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Input value */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

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

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the Picker container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Picker background color */
    backgroundColor: PropTypes.string,

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
    // eslint-disable-next-line react/no-unused-prop-types
    shouldSaveDraft: PropTypes.bool,

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onInputChange: PropTypes.func.isRequired,

    /** Size of a picker component */
    size: PropTypes.oneOf(['normal', 'small']),

    /** An icon to display with the picker */
    icon: PropTypes.func,

    /** Callback called when click or tap out of Picker */
    onBlur: PropTypes.func,

    /** Ref to be forwarded to RNPickerSelect component, provided by forwardRef, not parent component. */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.element,
        }),
    ]),
};

const defaultProps = {
    label: '',
    isDisabled: false,
    errorText: '',
    containerStyles: [],
    backgroundColor: undefined,
    inputID: undefined,
    shouldSaveDraft: false,
    value: undefined,
    placeholder: {},
    size: 'normal',
    icon: size => (
        <Icon
            src={Expensicons.DownArrow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
        />
    ),
    onBlur: () => {},
    innerRef: () => {},
};

export {propTypes, defaultProps};
