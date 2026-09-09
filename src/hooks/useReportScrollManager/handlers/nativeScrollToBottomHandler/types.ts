import type {ActionListRefType} from '@components/FlashList/types';

type NativeScrollToBottomHandlerParams = {
    listRef: ActionListRefType;
    isKeyboardActive: boolean;
    keyboardHeight: number;
};

type NativeScrollToBottomHandler = (params: NativeScrollToBottomHandlerParams) => void;

export default NativeScrollToBottomHandler;
