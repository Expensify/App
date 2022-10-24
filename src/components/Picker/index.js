import _ from 'underscore';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import BasePicker from './BasePicker';
import Text from '../Text';
import styles from '../../styles/styles';
import FormHelpMessage from '../FormHelpMessage';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Input value */
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the Picker container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** A callback method that is called when the value changes and it receives the selected value as an argument */
    onInputChange: PropTypes.func.isRequired,
};

const defaultProps = {
    label: '',
    isDisabled: false,
    errorText: '',
    containerStyles: [],
    inputID: undefined,
    shouldSaveDraft: false,
    value: undefined,
};

class Picker extends PureComponent {
    constructor() {
        super();
        this.state = {
            isOpen: false,
        };

        this.onInputChange = this.onInputChange.bind(this);
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

    render() {
        const pickerProps = _.omit(this.props, _.keys(propTypes));
        return (
            <>
                <View
                    style={[
                        styles.pickerContainer,
                        this.props.isDisabled && styles.inputDisabled,
                        ...this.props.containerStyles,
                    ]}
                >
                    {this.props.label && (
                        <Text style={[styles.pickerLabel, styles.textLabelSupporting]}>{this.props.label}</Text>
                    )}
                    <BasePicker
                        onOpen={() => this.setState({isOpen: true})}
                        onClose={() => this.setState({isOpen: false})}
                        disabled={this.props.isDisabled}
                        focused={this.state.isOpen}
                        errorText={this.props.errorText}
                        value={this.props.value}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...pickerProps}
                        onInputChange={this.onInputChange}
                    />
                </View>
                <FormHelpMessage>{this.props.errorText}</FormHelpMessage>
            </>
        );
    }
}

Picker.propTypes = propTypes;
Picker.defaultProps = defaultProps;

// eslint-disable-next-line react/jsx-props-no-spreading
export default React.forwardRef((props, ref) => <Picker {...props} innerRef={ref} key={props.inputID} />);
