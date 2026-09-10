import {useActionListContext} from '@pages/inbox/ActionListContext';

import type {ReportScrollManagerData, ScrollToIndexOptions} from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {getListRef} = useActionListContext();

    /**
     * Scroll to the provided index. When `isEditing` is set we skip the scroll so the list doesn't
     * jump while the user is editing a message.
     */
    const scrollToIndex = (index: number, {isEditing = false, animated = true, viewOffset, viewPosition}: ScrollToIndexOptions = {}) => {
        const listRef = getListRef();
        if (!listRef?.current || isEditing) {
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

    /**
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = () => {
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

        listRef.current.scrollToOffset({animated: true, offset});
    };

    return {scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
