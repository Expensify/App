import React from 'react';
import {View} from 'react-native';
import styles from '../../../../../styles/styles';
import Text from '../../../../../components/Text';
import * as StyleUtils from '../../../../../styles/StyleUtils';
import {
    propTypes as reactionPropTypes,
    defaultProps as reactionDefaultProps,
} from './reactionPropTypes';

const propTypes = {
    ...reactionPropTypes,
};

const defaultProps = {
    ...reactionDefaultProps,
};

const HeaderReactionList = props => (
    <View style={[styles.pt4, styles.mh5, styles.emojiReactionListHeader, styles.flexRow]}>
        <View style={[styles.emojiReactionListHeaderBubble, StyleUtils.getEmojiReactionListHeaderBubbleStyle(props.hasUserReacted)]}>
            <Text style={[styles.emojiReactionText, StyleUtils.getEmojiReactionTextStyle(props.sizeScale)]}>
                {props.emojiCodes.join('')}
            </Text>
            <Text style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted, props.sizeScale)]}>
                {props.emojiCount}
            </Text>
        </View>
        <Text style={styles.reactionListHeaderText}>{`:${props.emojiName}:`}</Text>
    </View>
);

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.defaultProps = defaultProps;
HeaderReactionList.displayName = 'HeaderReactionList';

export default HeaderReactionList;

