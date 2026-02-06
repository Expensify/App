import React from 'react';
import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';
import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

function QuickEmojiReactions({closeContextMenu, ...rest}: QuickEmojiReactionsProps) {
    const onPressOpenPicker = (openPicker?: OpenPickerCallback) => {
        openPicker?.();
    };

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onPressOpenPicker={onPressOpenPicker}
        />
    );
}

export default QuickEmojiReactions;
