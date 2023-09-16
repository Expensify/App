import React, {useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import BaseMiniContextMenuItem from '../BaseMiniContextMenuItem';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import getButtonState from '../../libs/getButtonState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import {baseQuickEmojiReactionsPropTypes, baseQuickEmojiReactionsDefaultProps} from './QuickEmojiReactions/BaseQuickEmojiReactions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as EmojiUtils from '../../libs/EmojiUtils';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,

    /**
     * Will be called when the user closed the emoji picker
     * without selecting an emoji.
     */
    onEmojiPickerClosed: PropTypes.func,

    /**
     * ReportAction for EmojiPicker.
     */
    reportAction: PropTypes.shape({
        reportActionID: PropTypes.string.isRequired,
    }),

    ...withLocalizePropTypes,
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const defaultProps = {
    ...baseQuickEmojiReactionsDefaultProps,
    onEmojiPickerClosed: () => {},
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    reportAction: {},
};

/**
 * Shows the four common quick reactions and a
 * emoji picker icon button. This is used for the mini
 * context menu which we just show on web, when hovering
 * a message.
 * @param {Props} props
 * @returns {JSX.Element}
 */
function MiniQuickEmojiReactions(props) {
    const ref = useRef();

    const openEmojiPicker = () => {
        props.onPressOpenPicker();
        EmojiPickerAction.showEmojiPicker(
            props.onEmojiPickerClosed,
            (emojiCode, emojiObject) => {
                props.onEmojiSelected(emojiObject, props.emojiReactions);
            },
            ref.current,
            undefined,
            () => {},
            props.reportAction.reportActionID,
        );
    };

    return (
        <View style={styles.flexRow}>
            {_.map(CONST.QUICK_REACTIONS, (emoji) => (
                <BaseMiniContextMenuItem
                    key={emoji.name}
                    isDelayButtonStateComplete={false}
                    tooltipText={`:${EmojiUtils.getLocalizedEmojiName(emoji.name, props.preferredLocale)}:`}
                    onPress={Session.checkIfActionIsAllowed(() => props.onEmojiSelected(emoji, props.emojiReactions))}
                >
                    <Text style={[styles.miniQuickEmojiReactionText, styles.userSelectNone]}>{EmojiUtils.getPreferredEmojiCode(emoji, props.preferredSkinTone)}</Text>
                </BaseMiniContextMenuItem>
            ))}
            <BaseMiniContextMenuItem
                ref={ref}
                onPress={Session.checkIfActionIsAllowed(() => {
                    if (!EmojiPickerAction.emojiPickerRef.current.isEmojiPickerVisible) {
                        openEmojiPicker();
                    } else {
                        EmojiPickerAction.emojiPickerRef.current.hideEmojiPicker();
                    }
                })}
                isDelayButtonStateComplete={false}
                tooltipText={props.translate('emojiReactions.addReactionTooltip')}
            >
                {({hovered, pressed}) => (
                    <Icon
                        small
                        src={Expensicons.AddReaction}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false))}
                    />
                )}
            </BaseMiniContextMenuItem>
        </View>
    );
}

MiniQuickEmojiReactions.displayName = 'MiniQuickEmojiReactions';
MiniQuickEmojiReactions.propTypes = propTypes;
MiniQuickEmojiReactions.defaultProps = defaultProps;
export default compose(
    withLocalize,
    // ESLint throws an error because it can't see that emojiReactions is defined in props. It is defined in props, but
    // because of a couple spread operators, I think that's why ESLint struggles to see it
    // eslint-disable-next-line rulesdir/onyx-props-must-have-default
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        emojiReactions: {
            key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
        },
    }),
)(MiniQuickEmojiReactions);
