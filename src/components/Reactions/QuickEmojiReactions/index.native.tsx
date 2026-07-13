import React from 'react';

import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';

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
