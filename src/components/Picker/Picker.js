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

    /** Additional events passed to the core Picker for specific platforms such as web */
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
    icon: size => (
        <Icon
            src={Expensicons.DownArrow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
        />
    ),
    onBlur: () => {},
    innerRef: () => {},
    additionalPickerEvents: () => {},
};

class Picker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isHighlighted: false,
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.enableHighlight = this.enableHighlight.bind(this);
        this.disableHighlight = this.disableHighlight.bind(this);

        // Windows will reuse the text color of the select for each one of the options
        // so we might need to color accordingly so it doesn't blend with the background.
        this.placeholder = _.isEmpty(this.props.placeholder) ? {} : {
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
     * Forms use inputID to set values. But Picker passes an index as the second parameter to onInputChange
     * We are overriding this behavior to make Picker work with Form
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

    render() {
        const hasError = !_.isEmpty(this.props.errorText);

        if (this.props.isDisabled) {
            return (
                <View>
                    {this.props.label && (
                        <Text style={[styles.textLabelSupporting, styles.mb1]} numberOfLines={1}>
                            {this.props.label}
                        </Text>
                    )}
                    <Text numberOfLines={1}>
                        {this.props.value}
                    </Text>
                    {this.props.hintText
                    && (
                        <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>
                            {this.props.hintText}
                        </Text>
                    )}
                </View>
            );
        }

        return (
            <>
                <View
                    style={[
                        styles.pickerContainer,
                        this.props.isDisabled && styles.inputDisabled,
                        ...this.props.containerStyles,
                        this.state.isHighlighted && styles.borderColorFocus,
                        hasError && styles.borderColorDanger,
                    ]}
                >
                    {this.props.label && (
                        <Text pointerEvents="none" style={[styles.pickerLabel, styles.textLabelSupporting]}>
                            {this.props.label}
                        </Text>
                    )}
                    <RNPickerSelect
                        onValueChange={this.onInputChange}

                        // We add a text color to prevent white text on white background dropdown items on Windows
                        items={_.map(this.props.items, item => ({...item, color: themeColors.pickerOptionsTextColor}))}
                        style={this.props.size === 'normal'
                            ? styles.picker(this.props.isDisabled, this.props.backgroundColor)
                            : styles.pickerSmall(this.props.backgroundColor)}
                        useNativeAndroidPickerStyle={false}
                        placeholder={this.placeholder}
                        value={this.props.value}
                        Icon={() => this.props.icon(this.props.size)}
                        disabled={this.props.isDisabled}
                        fixAndroidTouchableBug
                        onOpen={this.enableHighlight}
                        onClose={this.disableHighlight}
                        textInputProps={{allowFontScaling: false}}
                        pickerProps={{
                            onFocus: this.enableHighlight,
                            onBlur: () => {
                                this.disableHighlight();
                                this.props.onBlur();
                            },
                            ...this.props.additionalPickerEvents(
                                this.enableHighlight,
                                (value, index) => {
                                    this.onInputChange(value, index);
                                    this.disableHighlight();
                                },
                            ),
                        }}
                        ref={(el) => {
                            if (!_.isFunction(this.props.innerRef)) {
                                return;
                            }
                            this.props.innerRef(el);
                        }}
                        scrollViewRef={this.context && this.context.scrollViewRef}
                        scrollViewContentOffsetY={this.context && this.context.contentOffsetY}
                    />
                </View>
                <FormHelpMessage message={this.props.errorText} />
                {this.props.hintText
                    && (
                        <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>
                            {this.props.hintText}
                        </Text>
                    )}
            </>
        );
    }
}

Picker.propTypes = propTypes;
Picker.defaultProps = defaultProps;
Picker.contextType = ScrollContext;

// eslint-disable-next-line react/jsx-props-no-spreading
export default React.forwardRef((props, ref) => <Picker {...props} innerRef={ref} key={props.inputID} />);
