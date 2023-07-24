import _ from 'underscore';
import React, {useContext, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import RNPickerSelect from 'react-native-picker-select';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import FormHelpMessage from '../FormHelpMessage';
import Text from '../Text';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {ScrollContext} from '../ScrollViewWithContext';

const propTypes = {
    /** A forwarded ref */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

    /** BasePicker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Input value */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The items to display in the list of selections */
    items: PropTypes.arrayOf(
        PropTypes.shape({
            /** The value of the item that is being selected */
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

            /** The text to display for the item */
            label: PropTypes.string.isRequired,
        }),
    ).isRequired,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the BasePicker container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the BasePicker background color */
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

    /** Whether we should forward the focus/blur calls to the inner picker * */
    shouldFocusPicker: PropTypes.bool,

    /** Callback called when click or tap out of BasePicker */
    onBlur: PropTypes.func,

    /** Additional events passed to the core BasePicker for specific platforms such as web */
    additionalPickerEvents: PropTypes.func,

    /** Hint text that appears below the picker */
    hintText: PropTypes.string,
};

const defaultProps = {
    forwardedRef: undefined,
    label: '',
    isDisabled: false,
    errorText: '',
    hintText: '',
    containerStyles: [],
    backgroundColor: undefined,
    inputID: undefined,
    shouldSaveDraft: false,
    value: undefined,
    placeholder: {},
    size: 'normal',
    icon: (size) => (
        <Icon
            src={Expensicons.DownArrow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
        />
    ),
    shouldFocusPicker: false,
    onBlur: () => {},
    additionalPickerEvents: () => {},
};

function BasePicker(props) {
    const [isHighlighted, setIsHighlighted] = useState(false);

    // reference to the root View
    const root = useRef(null);

    // reference to @react-native-picker/picker
    const picker = useRef(null);

    // Windows will reuse the text color of the select for each one of the options
    // so we might need to color accordingly so it doesn't blend with the background.
    const placeholder = _.isEmpty(props.placeholder)
        ? {}
        : {
              ...props.placeholder,
              color: themeColors.pickerOptionsTextColor,
          };

    useEffect(() => {
        if (props.value || !props.items || props.items.length !== 1 || !props.onInputChange) {
            return;
        }

        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        props.onInputChange(props.items[0].value, 0);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items]);

    const context = useContext(ScrollContext);

    /**
     * Forms use inputID to set values. But BasePicker passes an index as the second parameter to onInputChange
     * We are overriding this behavior to make BasePicker work with Form
     * @param {String} value
     * @param {Number} index
     */
    const onInputChange = (value, index) => {
        if (props.inputID) {
            props.onInputChange(value);
            return;
        }

        props.onInputChange(value, index);
    };

    const enableHighlight = () => {
        setIsHighlighted(true);
    };

    const disableHighlight = () => {
        setIsHighlighted(false);
    };

    useImperativeHandle(props.forwardedRef, () => ({
        /**
         * Focuses the picker (if configured to do so)
         *
         * This method is used by Form
         */
        focus() {
            if (!props.shouldFocusPicker) {
                return;
            }

            // Defer the focusing to work around a bug on Mobile Safari, where focusing the `select` element in the
            // same task when we scrolled to it left that element in a glitched state, where the dropdown list can't
            // be opened until the element gets re-focused
            _.defer(() => {
                picker.current.focus();
            });
        },

        /**
         * Like measure(), but measures the view relative to an ancestor
         *
         * This method is used by Form when scrolling to the input
         *
         * @param {Object} relativeToNativeComponentRef - reference to an ancestor
         * @param {function(x: number, y: number, width: number, height: number): void} onSuccess - callback called on success
         * @param {function(): void} onFail - callback called on failure
         */
        measureLayout(relativeToNativeComponentRef, onSuccess, onFail) {
            if (!root.current) {
                return;
            }

            root.current.measureLayout(relativeToNativeComponentRef, onSuccess, onFail);
        },
    }));

    const hasError = !_.isEmpty(props.errorText);

    if (props.isDisabled) {
        return (
            <View>
                {Boolean(props.label) && (
                    <Text
                        style={[styles.textLabelSupporting, styles.mb1]}
                        numberOfLines={1}
                    >
                        {props.label}
                    </Text>
                )}
                <Text numberOfLines={1}>{props.value}</Text>
                {Boolean(props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{props.hintText}</Text>}
            </View>
        );
    }

    return (
        <>
            <View
                ref={root}
                style={[
                    styles.pickerContainer,
                    props.isDisabled && styles.inputDisabled,
                    ...props.containerStyles,
                    isHighlighted && styles.borderColorFocus,
                    hasError && styles.borderColorDanger,
                ]}
            >
                {props.label && (
                    <Text
                        pointerEvents="none"
                        style={[styles.pickerLabel, styles.textLabelSupporting]}
                    >
                        {props.label}
                    </Text>
                )}
                <RNPickerSelect
                    onValueChange={onInputChange}
                    // We add a text color to prevent white text on white background dropdown items on Windows
                    items={_.map(props.items, (item) => ({...item, color: themeColors.pickerOptionsTextColor}))}
                    style={props.size === 'normal' ? styles.picker(props.isDisabled, props.backgroundColor) : styles.pickerSmall(props.backgroundColor)}
                    useNativeAndroidPickerStyle={false}
                    placeholder={placeholder}
                    value={props.value}
                    Icon={() => props.icon(props.size)}
                    disabled={props.isDisabled}
                    fixAndroidTouchableBug
                    onOpen={enableHighlight}
                    onClose={disableHighlight}
                    textInputProps={{
                        allowFontScaling: false,
                    }}
                    pickerProps={{
                        ref: picker,
                        onFocus: enableHighlight,
                        onBlur: () => {
                            disableHighlight();
                            props.onBlur();
                        },
                        ...props.additionalPickerEvents(enableHighlight, (value, index) => {
                            onInputChange(value, index);
                            disableHighlight();
                        }),
                    }}
                    scrollViewRef={context && context.scrollViewRef}
                    scrollViewContentOffsetY={context && context.contentOffsetY}
                />
            </View>
            <FormHelpMessage message={props.errorText} />
            {Boolean(props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{props.hintText}</Text>}
        </>
    );
}

BasePicker.propTypes = propTypes;
BasePicker.defaultProps = defaultProps;
BasePicker.displayName = 'BasePicker';

export default React.forwardRef((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        // Forward the ref to BasePicker, as we implement imperative methods there
        forwardedRef={ref}
        // eslint-disable-next-line react/prop-types
        key={props.inputID}
    />
));
