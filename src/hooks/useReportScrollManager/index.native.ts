import {useActionListContext} from '@pages/inbox/ActionListContext';

import type {ReportScrollManagerData, ScrollToIndexOptions} from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {getListRef} = useActionListContext();

    /**
     * Scroll to the provided index. `isEditing` is accepted for signature parity with the web
     * implementation but is a no-op here, matching the previous native behavior. `animated`
     * defaults to `false` to match FlashList's default (the previous native call omitted it).
     */
    const scrollToIndex = (index: number, {animated = false, viewOffset, viewPosition}: ScrollToIndexOptions = {}) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }
        listRef.current.scrollToIndex({index, animated, viewOffset, viewPosition});
    };

    /** Scroll to the bottom of the chronological action list. */
    const scrollToBottom = () => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }

        listRef.current.scrollToEnd({animated: false});
    };

    const scrollToOffset = (offset: number) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }
        listRef.current.scrollToOffset({offset, animated: false});
    };

    return {scrollToIndex, scrollToBottom, scrollToOffset};
}

export default useReportScrollManager;
