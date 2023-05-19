import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Text from '../../../../components/Text';
import Icon from '../../../../components/Icon';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import * as StyleUtils from '../../../../styles/StyleUtils';
import reactionPropTypes from './reactionPropTypes';
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const propTypes = {
    ...reactionPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted: PropTypes.bool,
};

const defaultProps = {
    hasUserReacted: false,
};

const HeaderReactionList = (props) => (
    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.emojiReactionListHeader, !props.isSmallScreenWidth && styles.pt4]}>
        <View style={styles.flexRow}>
            <View style={[styles.emojiReactionListHeaderBubble, StyleUtils.getEmojiReactionBubbleStyle(false, props.hasUserReacted)]}>
                <Text style={[styles.miniQuickEmojiReactionText, StyleUtils.getEmojiReactionBubbleTextStyle(true)]}>{props.emojiCodes.join('')}</Text>
                <Text style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted)]}>{props.emojiCount}</Text>
            </View>
            <Text style={styles.reactionListHeaderText}>{`:${props.emojiName}:`}</Text>
        </View>

        {props.isSmallScreenWidth && (
            <TouchableOpacity
                onPress={props.onClose}
                accessibilityRole="button"
                accessibilityLabel={props.translate('common.close')}
            >
                <Icon src={Expensicons.Close} />
            </TouchableOpacity>
        )}
    </View>
);

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.defaultProps = defaultProps;
HeaderReactionList.displayName = 'HeaderReactionList';

export default compose(withWindowDimensions, withLocalize)(HeaderReactionList);
