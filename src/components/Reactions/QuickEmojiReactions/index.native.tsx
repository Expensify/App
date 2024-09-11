import React from 'react';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';
import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

function QuickEmojiReactions({closeContextMenu, ...rest}: QuickEmojiReactionsProps) {
    const onPressOpenPicker = (openPicker?: OpenPickerCallback) => {
        // We first need to close the menu as it's a popover.
        // The picker is a popover as well and on mobile there can only
        // be one active popover at a time.
        closeContextMenu(() => {
            // As the menu which includes the button to open the emoji picker
            // gets closed, before the picker actually opens, we pass the composer
            // ref as anchor for the emoji picker popover.
            openPicker?.(ReportActionComposeFocusManager.composerRef);
        });
    };

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onPressOpenPicker={onPressOpenPicker}
        />
    );
}

QuickEmojiReactions.displayName = 'QuickEmojiReactions';

export default QuickEmojiReactions;
