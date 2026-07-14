import type {FlashListRefType} from '@components/FlashList/types';
import type FlatListRefType from '@components/FlashList/types';

import type {RefObject} from 'react';

type ReportScrollManagerData = {
    /**
     * Scroll to a list index. `isEditing` suppresses the scroll (web only, defaults to `false`).
     * When `animated` is omitted each platform keeps its prior default: web animates, native jumps
     * instantly. ReportActionItemMessageEdit's Android Chrome keyboard hack passes `{animated: false}`
     * to scroll instantly when the edit composer gains focus and the soft keyboard shifts the viewport.
     */
    scrollToIndex: (index: number, options?: {isEditing?: boolean; animated?: boolean}) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

type ScrollToCommonParams = {
    listRef: FlatListRefType | FlashListRefType;
    isKeyboardActive: boolean;
    keyboardHeight: number;
};

type ScrollToOffsetHandlerParams = ScrollToCommonParams & {
    offset: number;
};

type ScrollToBottomHandlerParams = ScrollToCommonParams & {
    scrollPositionRef: RefObject<{offset: number}>;
};

export type {ScrollToBottomHandlerParams, ScrollToOffsetHandlerParams};
export default ReportScrollManagerData;
