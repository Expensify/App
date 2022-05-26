import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import Icon from './Icon';

const propTypes = {
    /** Error to display */
    message: PropTypes.string.isRequired,
};

const InlineSystemMessage = (props) => {
    if (props.message.length === 0) {
        return;
    }
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon src={Expensicons.Exclamation} fill={colors.red} />
            <Text style={[styles.inlineSystemMessage]}>{props.message}</Text>
        </View>
    );
};

InlineSystemMessage.propTypes = propTypes;
InlineSystemMessage.displayName = 'InlineSystemMessage';
export default InlineSystemMessage;
