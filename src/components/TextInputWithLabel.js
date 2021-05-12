import _ from 'underscore';
import React from 'react';
import {Text, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Label text
    label: PropTypes.string.isRequired,

    // Whether this field has an error
    hasError: PropTypes.bool,

    // Text to show if there is an error
    errorText: PropTypes.string,
};

const defaultProps = {
    hasError: false,
    errorText: '',
};

const TextInputWithLabel = props => (
    <>
        <Text style={[styles.formLabel]}>{props.label}</Text>
        <TextInput
            style={[styles.textInput, styles.mb1]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, ['label'])}
        />
        {props.errorText && props.hasError && (
            <Text style={[styles.formError]}>{props.errorText}</Text>
        )}
    </>
);

TextInputWithLabel.propTypes = propTypes;
TextInputWithLabel.defaultProps = defaultProps;
export default TextInputWithLabel;
