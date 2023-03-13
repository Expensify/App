import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import {withPersonalDetails} from '../OnyxProvider';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import Text from '../Text';

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
    accountIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ReactionTooltipContent = (props) => {
    const users = PersonalDetailsUtils.getPersonalDetailsByIDs(props.accountIDs);
    const namesString = _.filter(_.map(users, user => user && user.displayName), n => n).join(', ');

    return (
        <View style={[styles.alignItemsCenter, styles.ph2]}>
            <View style={styles.flexRow}>
                {_.map(props.emojiCodes, emojiCode => (
                    <Text
                        key={emojiCode}
                        style={styles.reactionEmojiTitle}
                    >
                        {emojiCode}
                    </Text>
                ))}
            </View>

            <Text style={[
                styles.mt1,
                styles.textMicroBold,
                styles.textReactionSenders,
            ]}
            >
                {namesString}
            </Text>

            <Text style={[
                styles.textMicro,
                styles.fontColorReactionLabel,
            ]}
            >
                {`reacted with :${props.emojiName}:`}
            </Text>
        </View>
    );
};

ReactionTooltipContent.propTypes = propTypes;
ReactionTooltipContent.displayName = 'ReactionTooltipContent';
export default React.memo(withPersonalDetails()(ReactionTooltipContent));
