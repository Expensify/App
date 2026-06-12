import React from 'react';
import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';
import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

function QuickEmojiReactions({closeContextMenu, ...rest}: QuickEmojiReactionsProps) {
    const onPressOpenPicker = (openPicker?: OpenPickerCallback) => {
        openPicker?.();
    };

    return (
        <BaseQuickEmojiReactions
            {...rest}
            onPressOpenPicker={onPressOpenPicker}
        />
    );
}

export default QuickEmojiReactions;
