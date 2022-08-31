import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import variables from '../styles/variables';
import Text from './Text';

const propTypes = {
    /** The messages to display  */
    messages: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.objectOf(PropTypes.string),
    ]),

    /** The type of message, 'error' shows a red dot, 'success' shows a green dot */
    type: PropTypes.oneOf(['error', 'success']).isRequired,

    /** Additional styles to apply to the container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    messages: [],
    style: [],

};

const DotIndicatorMessage = (props) => {
    if (_.isEmpty(props.messages)) {
        return null;
    }

    // If the messages are passed as an object (such as our Onyx errors), then grab the sorted values
    let sortedMessages = props.messages;
    if (!_.isArray(props.messages)) {
        sortedMessages = _.chain(props.messages)
            .keys()
            .sortBy()
            .map(key => props.messages[key])
            .value();
    }

    return (
        <View style={[styles.dotIndicatorMessage, ...props.style]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon src={Expensicons.DotIndicator} fill={props.type === 'error' ? colors.red : colors.green} height={variables.iconSizeSmall} width={variables.iconSizeSmall}/>
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {_.map(sortedMessages, (message, i) => (
                    <Text key={i} style={styles.offlineFeedback.text}>{message}</Text>
                ))}
            </View>
        </View>
    );
};

DotIndicatorMessage.propTypes = propTypes;
DotIndicatorMessage.defaultProps = defaultProps;

export default DotIndicatorMessage;

