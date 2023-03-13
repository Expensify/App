import _ from 'underscore';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import PropTypes from 'prop-types';
import FormHelpMessage from '../FormHelpMessage';
import Text from '../Text';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {ScrollContext} from '../ScrollViewWithContext';
import {defaultProps as pickerDefaultProps, propTypes as pickerPropTypes} from './pickerPropTypes';

const propTypes = {
    ...pickerPropTypes,

    /** Additional events passed to the core Picker for specific platforms such as web */
    additionalPickerEvents: PropTypes.func,

};

const defaultProps = {
    ...pickerDefaultProps,
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
            </>
        );
    }
}

Picker.propTypes = propTypes;
Picker.defaultProps = defaultProps;
Picker.contextType = ScrollContext;

// eslint-disable-next-line react/jsx-props-no-spreading
export default React.forwardRef((props, ref) => <Picker {...props} innerRef={ref} key={props.inputID} />);
