import type {ScrollToBottomHandlerParams} from '@hooks/useReportScrollManager/types';

function scrollToBottomHandler({flatListRef, scrollPositionRef}: ScrollToBottomHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    scrollPositionRef.current = {offset: 0};

    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
}

export default scrollToBottomHandler;
