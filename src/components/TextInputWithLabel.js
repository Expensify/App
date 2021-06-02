import _ from 'underscore';
import React from 'react';
import {Text, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Label text
    label: PropTypes.string.isRequired,

    // Text to show if there is an error
    errorText: PropTypes.string,
};

const defaultProps = {
    errorText: '',
};

const TextInputWithLabel = props => (
    <>
        <Text style={[styles.formLabel]}>{props.label}</Text>
        <TextInput
            style={[styles.textInput, styles.mb1]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, ['label', 'errorText'])}
        />
        {props.errorText !== '' && (
            <Text style={[styles.formError]}>{props.errorText}</Text>
        )}
    </>
);

TextInputWithLabel.propTypes = propTypes;
TextInputWithLabel.defaultProps = defaultProps;
TextInputWithLabel.displayName = 'TextInputWithLabel';
export default TextInputWithLabel;
