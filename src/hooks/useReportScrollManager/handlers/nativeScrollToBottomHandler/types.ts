import type {FlashListRefType} from '@components/FlashList/types';
import type FlatListRefType from '@components/FlashList/types';

type NativeScrollToBottomHandlerParams = {
    listRef: FlatListRefType | FlashListRefType;
    isKeyboardActive: boolean;
    keyboardHeight: number;
};

type NativeScrollToBottomHandler = (params: NativeScrollToBottomHandlerParams) => void;

export default NativeScrollToBottomHandler;
