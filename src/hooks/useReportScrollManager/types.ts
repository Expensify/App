import type {FlashListRefType} from '@components/FlashList/types';
import type FlatListRefType from '@components/FlashList/types';

import type {RefObject} from 'react';

type ScrollToIndexOptions = {
    /** Is user editing message */
    isEditing?: boolean;

    /** Should scroll be animated */
    animated?: boolean;

    /** Position of the target item relative to the viewport (0 = top, 0.5 = center, 1 = bottom) */
    viewPosition?: number;

    /** Additional offset to apply after viewPosition calculation */
    viewOffset?: number;
};

type ReportScrollManagerData = {
    /**
     * Scroll to a list index. `isEditing` suppresses the scroll (web only, defaults to `false`).
     * When `animated` is omitted each platform keeps its prior default: web animates, native jumps
     * instantly. ReportActionItemMessageEdit's Android Chrome keyboard hack passes `{animated: false}`
     * to scroll instantly when the edit composer gains focus and the soft keyboard shifts the viewport.
     */
    scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
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

export type {ReportScrollManagerData, ScrollToIndexOptions, ScrollToBottomHandlerParams, ScrollToOffsetHandlerParams};
