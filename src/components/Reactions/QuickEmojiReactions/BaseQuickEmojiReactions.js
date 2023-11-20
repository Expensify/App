import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AddReactionBubble from '@components/Reactions/AddReactionBubble';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import EmojiReactionsPropTypes from '@components/Reactions/EmojiReactionsPropTypes';
import Tooltip from '@components/Tooltip';
import * as EmojiUtils from '@libs/EmojiUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const baseQuickEmojiReactionsPropTypes = {
    emojiReactions: EmojiReactionsPropTypes,

    /**
     * Callback to fire when an emoji is selected.
     */
    onEmojiSelected: PropTypes.func.isRequired,

    /**
     * Will be called when the emoji picker is about to show.
     */
    onWillShowPicker: PropTypes.func,

    /**
     * Callback to fire when the "open emoji picker" button is pressed.
     * The function receives an argument which can be called
     * to actually open the emoji picker.
     */
    onPressOpenPicker: PropTypes.func,

    /**
     * ReportAction for EmojiPicker.
     */
    reportAction: PropTypes.object,

    preferredLocale: PropTypes.string,
};

const baseQuickEmojiReactionsDefaultProps = {
    emojiReactions: {},
    onWillShowPicker: () => {},
    onPressOpenPicker: () => {},
    reportAction: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
};

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const defaultProps = {
    ...baseQuickEmojiReactionsDefaultProps,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
};

function BaseQuickEmojiReactions(props) {
    const styles = useThemeStyles();
    return (
        <View style={styles.quickReactionsContainer}>
            {_.map(CONST.QUICK_REACTIONS, (emoji) => (
                <Tooltip
                    text={`:${EmojiUtils.getLocalizedEmojiName(emoji.name, props.preferredLocale)}:`}
                    key={emoji.name}
                >
                    <View>
                        <EmojiReactionBubble
                            emojiCodes={[EmojiUtils.getPreferredEmojiCode(emoji, props.preferredSkinTone)]}
                            isContextMenu
                            onPress={Session.checkIfActionIsAllowed(() => props.onEmojiSelected(emoji, props.emojiReactions))}
                        />
                    </View>
                </Tooltip>
            ))}
            <AddReactionBubble
                isContextMenu
                onPressOpenPicker={props.onPressOpenPicker}
                onWillShowPicker={props.onWillShowPicker}
                onSelectEmoji={(emoji) => props.onEmojiSelected(emoji, props.emojiReactions)}
                reportAction={props.reportAction}
            />
        </View>
    );
}

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
BaseQuickEmojiReactions.propTypes = propTypes;
BaseQuickEmojiReactions.defaultProps = defaultProps;
export default withOnyx({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
    emojiReactions: {
        key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(BaseQuickEmojiReactions);

export {baseQuickEmojiReactionsPropTypes, baseQuickEmojiReactionsDefaultProps};
