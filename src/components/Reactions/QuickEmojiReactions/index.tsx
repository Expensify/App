import React from 'react';
import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';
import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

function QuickEmojiReactions({closeContextMenu, ...rest}: QuickEmojiReactionsProps) {
    const onPressOpenPicker = (openPicker?: OpenPickerCallback) => {
        openPicker?.(contextMenuRef.current?.contentRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        });
    };

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onPressOpenPicker={onPressOpenPicker}
            onWillShowPicker={closeContextMenu}
        />
    );
}

export default QuickEmojiReactions;
