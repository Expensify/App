import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import React from 'react';

import type {OpenPickerCallback, QuickEmojiReactionsProps} from './types';

import BaseQuickEmojiReactions from './BaseQuickEmojiReactions';

function QuickEmojiReactions({closeContextMenu, ...rest}: QuickEmojiReactionsProps) {
    const onPressOpenPicker = (openPicker?: OpenPickerCallback) => {
        openPicker?.(contextMenuRef.current?.contentRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        });
    };

    return (
        <BaseQuickEmojiReactions
            {...rest}
            onPressOpenPicker={onPressOpenPicker}
            onWillShowPicker={closeContextMenu}
        />
    );
}

export default QuickEmojiReactions;
