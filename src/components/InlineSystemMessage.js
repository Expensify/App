import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import theme from '../styles/themes/default';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import Icon from './Icon';

const propTypes = {
    /** Error to display */
    message: PropTypes.string,
};

const defaultProps = {
    message: '',
};

const InlineSystemMessage = (props) => {
    if (props.message.length === 0) {
        return null;
    }
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon src={Expensicons.Exclamation} fill={theme.badgeDangerBG} />
            <Text style={[styles.inlineSystemMessage]}>{props.message}</Text>
        </View>
    );
};

InlineSystemMessage.propTypes = propTypes;
InlineSystemMessage.defaultProps = defaultProps;
InlineSystemMessage.displayName = 'InlineSystemMessage';
export default InlineSystemMessage;
