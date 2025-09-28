import type {ScrollToOffsetHandlerParams} from '@hooks/useReportScrollManager/types';

function scrollToOffsetHandler({flatListRef, offset}: ScrollToOffsetHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    flatListRef.current.scrollToOffset({offset, animated: false});
}

export default scrollToOffsetHandler;
