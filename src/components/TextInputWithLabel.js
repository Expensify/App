import _ from 'underscore';
import React from 'react';
import {View, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import TextLink from './TextLink';

const propTypes = {
    /** Label text */
    label: PropTypes.string,

    /** Text to show if there is an error */
    errorText: PropTypes.string,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Text to use for a link shown after the label */
    helpLinkText: PropTypes.string,

    /** URL to use for a link shown after the label */
    helpLinkURL: PropTypes.string,
};

const defaultProps = {
    label: '',
    errorText: '',
    containerStyles: [],
    helpLinkText: '',
    helpLinkURL: '',
};

const TextInputWithLabel = props => (
    <View style={props.containerStyles}>
        <View
            style={[
                styles.flexRow,
                (!_.isEmpty(props.label) && !_.isEmpty(props.helpLinkURL)) ? styles.alignItemsBaseline : undefined,
            ]}
        >
            {!_.isEmpty(props.label) && <Text style={[styles.formLabel]}>{props.label}</Text>}
            {!_.isEmpty(props.helpLinkURL) && (
                <TextLink
                    href={props.helpLinkURL}
                    style={!_.isEmpty(props.label) ? [styles.textItalic, styles.textMicro, styles.ml2] : undefined}
                >
                    {props.helpLinkText || props.helpLinkURL}
                </TextLink>
            )}
        </View>
        <TextInput
            style={[styles.textInput, styles.mb1]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, ['label', 'errorText'])}
        />
        {props.errorText !== '' && (
            <Text style={[styles.formError]}>{props.errorText}</Text>
        )}
    </View>
);

TextInputWithLabel.propTypes = propTypes;
TextInputWithLabel.defaultProps = defaultProps;
TextInputWithLabel.displayName = 'TextInputWithLabel';
export default TextInputWithLabel;
