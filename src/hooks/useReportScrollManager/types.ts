import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';

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
    setScrollPosition: (position: {offset: number}) => void;
};

export type {ScrollToBottomHandlerParams, ScrollToOffsetHandlerParams};
export default ReportScrollManagerData;
