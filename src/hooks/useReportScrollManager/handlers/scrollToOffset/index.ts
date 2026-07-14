import type {ScrollToOffsetHandlerParams} from '@hooks/useReportScrollManager/types';

function scrollToOffsetHandler({listRef, offset}: ScrollToOffsetHandlerParams) {
    if (!listRef?.current) {
        return;
    }

    listRef.current.scrollToOffset({offset, animated: false});
}

export default scrollToOffsetHandler;
