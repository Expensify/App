import type {FlatListRefType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: FlatListRefType;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

type ScrollToBottomHandlerParams = {
    flatListRef: FlatListRefType;
    isKeyboardActive: boolean;
    keyboardHeight: number;
    setScrollPosition: (position: {offset: number}) => void;
};

export type {ScrollToBottomHandlerParams};
export default ReportScrollManagerData;
