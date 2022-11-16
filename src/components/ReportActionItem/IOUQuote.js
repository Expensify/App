import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onViewDetailsPressed: () => {},
};

const IOUQuote = props => (
    <View style={[styles.chatItemMessage]}>
        {_.map(props.action.message, (fragment, index) => (
            <View key={`iouQuote-${props.action.reportActionID}-${index}`} style={[styles.textInputAndIconContainer, styles.alignItemsStart, styles.justifyContentBetween]}>
                <Text>
                    <Text
                        style={[styles.chatItemMessageLink]}
                        onPress={props.onViewDetailsPressed}
                    >
                        {Str.htmlDecode(fragment.text.split(' ')[0])}
                    </Text>
                    <Text style={[styles.chatItemMessage]}>
                        {Str.htmlDecode(fragment.text.substring(fragment.text.indexOf(' ')))}
                    </Text>
                </Text>
                <Pressable onPress={props.onViewDetailsPressed}>
                    <Icon src={Expensicons.ArrowRight} fill={themeColors.gray3} />
                </Pressable>
            </View>
        ))}
    </View>
);

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
