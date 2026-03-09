import type {FlatListRefType, ScrollPosition} from '@pages/inbox/ReportScreenContext';
import type {RefObject} from 'react';

type ReportScrollManagerData = {
    ref: FlatListRefType;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

type ScrollToCommonParams = {
    flatListRef: FlatListRefType;
    isKeyboardActive: boolean;
    keyboardHeight: number;
};

type ScrollToOffsetHandlerParams = ScrollToCommonParams & {
    offset: number;
};

type ScrollToBottomHandlerParams = ScrollToCommonParams & {
    scrollPositionRef: RefObject<ScrollPosition>;
};

export type {ScrollToBottomHandlerParams, ScrollToOffsetHandlerParams};
export default ReportScrollManagerData;
