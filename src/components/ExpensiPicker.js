import _ from 'underscore';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Picker from './Picker';
import Text from './Text';
import styles from '../styles/styles';
import InlineErrorText from './InlineErrorText';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the ExpensiPicker container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    label: '',
    isDisabled: false,
    hasError: false,
    errorText: '',
    containerStyles: [],
};

class ExpensiPicker extends PureComponent {
    constructor() {
        super();
        this.state = {
            isOpen: false,
        };
    }

    render() {
        const pickerProps = _.omit(this.props, _.keys(propTypes));
        return (
            <>
                <View
                    style={[
                        styles.expensiPickerContainer,
                        this.props.isDisabled && styles.inputDisabled,
                    ]}
                >
                    {this.props.label && (
                        <Text style={[styles.expensiPickerLabel, styles.textLabelSupporting]}>{this.props.label}</Text>
                    )}
                    <Picker
                        onOpen={() => this.setState({isOpen: true})}
                        onClose={() => this.setState({isOpen: false})}
                        disabled={this.props.isDisabled}
                        focused={this.state.isOpen}
                        hasError={this.props.hasError}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...pickerProps}
                    />
                </View>
                {!_.isEmpty(this.props.errorText) && (
                    <InlineErrorText>
                        {this.props.errorText}
                    </InlineErrorText>
                )}
            </>
        );
    }
}

ExpensiPicker.propTypes = propTypes;
ExpensiPicker.defaultProps = defaultProps;

export default ExpensiPicker;
