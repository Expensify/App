import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as EmojiUtils from '@libs/EmojiUtils';
import reactionPropTypes from './reactionPropTypes';

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

function HeaderReactionList(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.emojiReactionListHeader, !props.isSmallScreenWidth && styles.pt4]}>
            <View style={styles.flexRow}>
                <View style={[styles.emojiReactionListHeaderBubble, StyleUtils.getEmojiReactionBubbleStyle(false, props.hasUserReacted)]}>
                    <Text style={[styles.miniQuickEmojiReactionText, StyleUtils.getEmojiReactionBubbleTextStyle(true)]}>{props.emojiCodes.join('')}</Text>
                    <Text style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted)]}>{props.emojiCount}</Text>
                </View>
                <Text style={styles.reactionListHeaderText}>{`:${EmojiUtils.getLocalizedEmojiName(props.emojiName, props.preferredLocale)}:`}</Text>
            </View>
        </View>
    );
}

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.defaultProps = defaultProps;
HeaderReactionList.displayName = 'HeaderReactionList';

export default compose(withWindowDimensions, withLocalize)(HeaderReactionList);
