import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import {emojiPickerRef, resetEmojiPopoverAnchor, showEmojiPicker} from '@userActions/EmojiPickerAction';
import type {AnchorOrigin} from '@userActions/EmojiPickerAction';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {CloseContextMenuCallback, OpenPickerCallback, PickerRefElement} from './QuickEmojiReactions/types';

type AddReactionBubbleProps = {
    /** Whether it is for context menu so we can modify its style */
    isContextMenu?: boolean;

    /**
     * Called when the user presses on the icon button.
     * Will have a function as parameter which you can call
     * to open the picker.
     */
    onPressOpenPicker?: (openPicker: OpenPickerCallback) => void;

    /**
     * Will get called the moment before the picker opens.
     */
    onWillShowPicker?: (callback?: CloseContextMenuCallback) => void;

    /**
     * Called when the user selects an emoji.
     */
    onSelectEmoji: (emoji: Emoji, preferredSkinTone: number) => void;

    /**
     * ReportAction for EmojiPicker.
     */
    reportAction: ReportAction;

    /** Function to update emoji picker state */
    setIsEmojiPickerActive?: (state: boolean) => void;
};

function AddReactionBubble({onSelectEmoji, reportAction, onPressOpenPicker, onWillShowPicker = () => {}, isContextMenu = false, setIsEmojiPickerActive}: AddReactionBubbleProps) {
    const icons = useMemoizedLazyExpensifyIcons(['AddReaction']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const ref = useRef<View | HTMLDivElement>(null);
    const {translate} = useLocalize();

    useEffect(() => resetEmojiPopoverAnchor, []);

    const onPress = () => {
        const openPicker = (refParam?: PickerRefElement, anchorOrigin?: AnchorOrigin) => {
            showEmojiPicker({
                onModalHide: () => {
                    setIsEmojiPickerActive?.(false);
                },
                onEmojiSelected: (emojiCode, emojiObject, preferredSkinTone) => {
                    onSelectEmoji(emojiObject, preferredSkinTone);
                },
                emojiPopoverAnchor: refParam ?? ref,
                anchorOrigin,
                onWillShow: onWillShowPicker,
                id: reportAction.reportActionID,
                composerToRefocusOnClose: contextMenuRef.current?.composerToRefocusOnCloseEmojiPicker,
            });
        };

        if (!emojiPickerRef.current?.isEmojiPickerVisible) {
            setIsEmojiPickerActive?.(true);
            if (onPressOpenPicker) {
                onPressOpenPicker(openPicker);
            } else {
                openPicker();
            }
        } else {
            setIsEmojiPickerActive?.(false);
            emojiPickerRef.current.hideEmojiPicker();
        }
    };

    return (
        <Tooltip text={translate('emojiReactions.addReactionTooltip')}>
            <PressableWithFeedback
                ref={ref}
                style={({hovered, pressed}) => [styles.emojiReactionBubble, styles.userSelectNone, StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, false, isContextMenu)]}
                onPress={callFunctionIfActionIsAllowed(onPress)}
                onMouseDown={(event) => {
                    // Allow text input blur when Add reaction is right clicked
                    if (!event || event.button === 2) {
                        return;
                    }

                    // Prevent text input blur when Add reaction is left clicked
                    event.preventDefault();
                }}
                accessibilityLabel={translate('emojiReactions.addReactionTooltip')}
                role={CONST.ROLE.BUTTON}
                // disable dimming
                pressDimmingValue={1}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.EMOJI_REACTIONS.ADD_REACTION_BUBBLE}
            >
                {({hovered, pressed}) => (
                    <>
                        {/* This (invisible) text will make the view have the same size as a regular
               emoji reaction. We make the text invisible and put the
               icon on top of it. */}
                        <Text style={[styles.opacity0, StyleUtils.getEmojiReactionBubbleTextStyle(isContextMenu)]}>{'\u2800\u2800'}</Text>
                        <View style={styles.pAbsolute}>
                            <Icon
                                src={icons.AddReaction}
                                width={isContextMenu ? variables.iconSizeNormal : variables.iconSizeSmall}
                                height={isContextMenu ? variables.iconSizeNormal : variables.iconSizeSmall}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        </View>
                    </>
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default AddReactionBubble;
