import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import BaseQuickEmojiReactions, {baseQuickEmojiReactionsPropTypes} from './BaseQuickEmojiReactions';
import * as ActionSheetAwareScrollView from '../../ActionSheetAwareScrollView';

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,

    /**
     * Function that can be called to close the
     * context menu in which this component is
     * rendered.
     */
    closeContextMenu: PropTypes.func.isRequired,
};

function QuickEmojiReactions(props) {
    const actionSheetAwareScrollViewContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);

    const onPressOpenPicker = (openPicker) => {
        actionSheetAwareScrollViewContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.OPEN_EMOJI_PICKER_POPOVER,
        });

        // We first need to close the menu as it's a popover.
        // The picker is a popover as well and on mobile there can only
        // be one active popover at a time.
        props.closeContextMenu(() => {
            // As the menu which includes the button to open the emoji picker
            // gets closed, before the picker actually opens, we pass the composer
            // ref as anchor for the emoji picker popover.

            openPicker(ReportActionComposeFocusManager.composerRef.current, undefined, () => {
                actionSheetAwareScrollViewContext.transitionActionSheetState({
                    type: ActionSheetAwareScrollView.Actions.CLOSE_EMOJI_PICKER_POPOVER,
                });
            });
        });
    };

    const onEmojiSelected = (emoji) => {
        actionSheetAwareScrollViewContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.CLOSE_EMOJI_PICKER_POPOVER,
        });

        props.onEmojiSelected(emoji);
    };

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onEmojiSelected={onEmojiSelected}
            onPressOpenPicker={onPressOpenPicker}
        />
    );
}

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
QuickEmojiReactions.propTypes = propTypes;

export default QuickEmojiReactions;
