import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import BaseQuickEmojiReactions, {baseQuickEmojiReactionsPropTypes} from './BaseQuickEmojiReactions';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';
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

const QuickEmojiReactions = (props) => {
    const actionSheetContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);

    const onPressOpenPicker = (openPicker) => {
        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.OPEN_EMOJI_PICKER_POPOVER,
        });

        // We first need to close the menu as it's a popover.
        // The picker is a popover as well and on mobile there can only
        // be one active popover at a time.
        props.closeContextMenu(() => {
            // As the menu which includes the button to open the emoji picker
            // gets closed, before the picker actually opens, we pass the composer
            // ref as anchor for the emoji picker popover.

            openPicker(
                ReportActionComposeFocusManager.composerRef.current,
                undefined,
                () => {
                    actionSheetContext.transitionActionSheetState({
                        type: ActionSheetAwareScrollView.Actions.CLOSE_EMOJI_PICKER_POPOVER,
                    });
                },
            );
        });
    };

    const onEmojiSelected = (emoji) => {
        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.CLOSE_EMOJI_PICKER_POPOVER,
        });

        props.onEmojiSelected(emoji);
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <BaseQuickEmojiReactions {...props} onEmojiSelected={onEmojiSelected} onPressOpenPicker={onPressOpenPicker} />
    );
};

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
QuickEmojiReactions.propTypes = propTypes;

export default QuickEmojiReactions;
