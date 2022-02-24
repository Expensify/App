import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import React from 'react';
import BaseTextInput from '../BaseTextInput';
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
                props.disabled ? styles.inputDisabled : undefined,
                props.errorText ? styles.errorOutline : undefined,
            ]}
        >
            <Text style={styles.textInputWithPrefix.prefix}>{props.prefixCharacter}</Text>
            <BaseTextInput
                style={[
                    styles.textInputWithPrefix.textInput,
                    styles.noOutline,
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
