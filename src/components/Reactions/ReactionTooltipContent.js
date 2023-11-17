import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize from '@components/withLocalize';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /**
     * A list of emoji codes to display in the tooltip.
     */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /**
     * The name of the emoji to display in the tooltip.
     */
    emojiName: PropTypes.string.isRequired,

    /**
     * A list of account IDs to display in the tooltip.
     */
    accountIDs: PropTypes.arrayOf(PropTypes.number).isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function ReactionTooltipContent(props) {
    const styles = useThemeStyles();
    const users = useMemo(
        () => PersonalDetailsUtils.getPersonalDetailsByIDs(props.accountIDs, props.currentUserPersonalDetails.accountID, true),
        [props.currentUserPersonalDetails.accountID, props.accountIDs],
    );
    const namesString = _.filter(
        _.map(users, (user) => user && user.displayName),
        (n) => n,
    ).join(', ');
    return (
        <View style={[styles.alignItemsCenter, styles.ph2]}>
            <View style={styles.flexRow}>
                {_.map(props.emojiCodes, (emojiCode) => (
                    <Text
                        key={emojiCode}
                        style={styles.reactionEmojiTitle}
                    >
                        {emojiCode}
                    </Text>
                ))}
            </View>

            <Text style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{namesString}</Text>

            <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{`${props.translate('emojiReactions.reactedWith')} :${props.emojiName}:`}</Text>
        </View>
    );
}

ReactionTooltipContent.propTypes = propTypes;
ReactionTooltipContent.defaultProps = defaultProps;
ReactionTooltipContent.displayName = 'ReactionTooltipContent';
export default React.memo(withLocalize(ReactionTooltipContent));
