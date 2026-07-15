import type NativeScrollToBottomHandler from './types';

const nativeScrollToBottomHandler: NativeScrollToBottomHandler = ({listRef}) => {
    if (!listRef?.current) {
        return;
    }

    listRef.current.scrollToOffset({animated: false, offset: 0});
};

export default nativeScrollToBottomHandler;
