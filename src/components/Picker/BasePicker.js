import _ from 'underscore';
import React, {PureComponent} from 'react';
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

/**
 * @property {View} root - a reference to the root View
 * @property {Object} picker - a reference to @react-native-picker/picker
 */
class BasePicker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isHighlighted: false,
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.enableHighlight = this.enableHighlight.bind(this);
        this.disableHighlight = this.disableHighlight.bind(this);
        this.focus = this.focus.bind(this);
        this.measureLayout = this.measureLayout.bind(this);

        // Windows will reuse the text color of the select for each one of the options
        // so we might need to color accordingly so it doesn't blend with the background.
        this.placeholder = _.isEmpty(this.props.placeholder)
            ? {}
            : {
                  ...this.props.placeholder,
                  color: themeColors.pickerOptionsTextColor,
              };
    }

    componentDidMount() {
        this.setDefaultValue();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.items === this.props.items) {
            return;
        }
        this.setDefaultValue();
    }

    /**
     * Forms use inputID to set values. But BasePicker passes an index as the second parameter to onInputChange
     * We are overriding this behavior to make BasePicker work with Form
     * @param {String} value
     * @param {Number} index
     */
    onInputChange(value, index) {
        if (this.props.inputID) {
            this.props.onInputChange(value);
            return;
        }

        this.props.onInputChange(value, index);
    }

    setDefaultValue() {
        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        if (this.props.value || !this.props.items || this.props.items.length !== 1 || !this.props.onInputChange) {
            return;
        }
        this.props.onInputChange(this.props.items[0].value, 0);
    }

    enableHighlight() {
        this.setState({
            isHighlighted: true,
        });
    }

    disableHighlight() {
        this.setState({
            isHighlighted: false,
        });
    }

    /**
     * Focuses the picker (if configured to do so)
     *
     * This method is used by Form
     */
    focus() {
        if (!this.props.shouldFocusPicker) {
            return;
        }

        // Defer the focusing to work around a bug on Mobile Safari, where focusing the `select` element in the same
        // task when we scrolled to it left that element in a glitched state, where the dropdown list can't be opened
        // until the element gets re-focused
        _.defer(() => {
            this.picker.focus();
        });
    }

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
        if (!this.root) {
            return;
        }

        this.root.measureLayout(relativeToNativeComponentRef, onSuccess, onFail);
    }

    render() {
        const hasError = !_.isEmpty(this.props.errorText);

        if (this.props.isDisabled) {
            return (
                <View>
                    {Boolean(this.props.label) && (
                        <Text
                            style={[styles.textLabelSupporting, styles.mb1]}
                            numberOfLines={1}
                        >
                            {this.props.label}
                        </Text>
                    )}
                    <Text numberOfLines={1}>{this.props.value}</Text>
                    {Boolean(this.props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{this.props.hintText}</Text>}
                </View>
            );
        }

        return (
            <>
                <View
                    ref={(el) => (this.root = el)}
                    style={[
                        styles.pickerContainer,
                        this.props.isDisabled && styles.inputDisabled,
                        ...this.props.containerStyles,
                        this.state.isHighlighted && styles.borderColorFocus,
                        hasError && styles.borderColorDanger,
                    ]}
                >
                    {this.props.label && (
                        <Text
                            pointerEvents="none"
                            style={[styles.pickerLabel, styles.textLabelSupporting]}
                        >
                            {this.props.label}
                        </Text>
                    )}
                    <RNPickerSelect
                        onValueChange={this.onInputChange}
                        // We add a text color to prevent white text on white background dropdown items on Windows
                        items={_.map(this.props.items, (item) => ({...item, color: themeColors.pickerOptionsTextColor}))}
                        style={this.props.size === 'normal' ? styles.picker(this.props.isDisabled, this.props.backgroundColor) : styles.pickerSmall(this.props.backgroundColor)}
                        useNativeAndroidPickerStyle={false}
                        placeholder={this.placeholder}
                        value={this.props.value}
                        Icon={() => this.props.icon(this.props.size)}
                        disabled={this.props.isDisabled}
                        fixAndroidTouchableBug
                        onOpen={this.enableHighlight}
                        onClose={this.disableHighlight}
                        textInputProps={{
                            allowFontScaling: false,
                        }}
                        pickerProps={{
                            ref: (el) => (this.picker = el),
                            onFocus: this.enableHighlight,
                            onBlur: () => {
                                this.disableHighlight();
                                this.props.onBlur();
                            },
                            ...this.props.additionalPickerEvents(this.enableHighlight, (value, index) => {
                                this.onInputChange(value, index);
                                this.disableHighlight();
                            }),
                        }}
                        scrollViewRef={this.context && this.context.scrollViewRef}
                        scrollViewContentOffsetY={this.context && this.context.contentOffsetY}
                    />
                </View>
                <FormHelpMessage message={this.props.errorText} />
                {Boolean(this.props.hintText) && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{this.props.hintText}</Text>}
            </>
        );
    }
}

BasePicker.propTypes = propTypes;
BasePicker.defaultProps = defaultProps;
BasePicker.contextType = ScrollContext;

export default React.forwardRef((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        // Forward the ref to BasePicker, as we implement imperative methods there
        ref={ref}
        key={props.inputID}
    />
));
