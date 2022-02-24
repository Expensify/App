import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import {View} from 'react-native';
import _ from 'underscore';
import React from 'react';
import TextInput from '../baseTextInput';
import Text from '../Text';
import styles from '../../styles/styles';
import InlineErrorText from '../InlineErrorText';

const propTypes = {
    /** Prefix character */
    prefixCharacter: PropTypes.string.isRequired,

    /** Text to show if there is an error */
    errorText: PropTypes.string,

    /** Whether to disable the field and style */
    disabled: PropTypes.bool,

};

const defaultProps = {
    errorText: '',
    disabled: false,
};

const TextInputWithPrefix = props => (
    <>
        <View
            style={[
                styles.textInputWithPrefix.container,
                {paddingTop: 0},
                props.disabled && styles.inputDisabled,
                props.errorText && styles.errorOutline,
            ]}
        >
            <Text style={[styles.textInputWithPrefix.prefix, {paddingTop: 10}]}>{props.prefixCharacter}</Text>
            <TextInput
                style={[
                    styles.textInputWithPrefix.textInput,
                    styles.noOutline,
                    {height: 40},
                ]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {..._.omit(props, ['prefixCharacter', 'errorText'])}
            />
        </View>
        {!_.isEmpty(props.errorText) && (
            <InlineErrorText>
                {props.errorText}
            </InlineErrorText>
        )}
    </>
);

TextInputWithPrefix.propTypes = propTypes;
TextInputWithPrefix.defaultProps = defaultProps;
export default TextInputWithPrefix;
