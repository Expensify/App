import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import {TextInput, View} from 'react-native';
import _ from 'underscore';
import React from 'react';
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

    /** Callback to execute the text input is modified */
    onChangeText: PropTypes.func,
};

const defaultProps = {
    errorText: '',
    disabled: false,
    onChangeText: () => {},
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
                onChangeText={text => props.onChangeText(`${props.prefixCharacter}${text}`)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {..._.omit(props, ['prefixCharacter', 'errorText', 'onChangeText'])}
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
