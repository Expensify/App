import type {ScrollToBottomHandlerParams} from '@hooks/useReportScrollManager/types';

function scrollToBottomHandler({flatListRef, setScrollPosition}: ScrollToBottomHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    setScrollPosition({offset: 0});

    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
}

export default scrollToBottomHandler;
