import {useContext, useCallback} from 'react';
import {ActionListContext} from '../../pages/home/ReportScreenContext';
import ReportScrollManagerData from './types';

let isAutomaticScrollToBottom = false;

function useReportScrollManager(): ReportScrollManagerData {
    const flatListRef = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     */
    const scrollToIndex = (index: number) => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToIndex({index});
    };

    /**
     * Scroll to the bottom of the flatlist.
     */
    const scrollToBottom = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        isAutomaticScrollToBottom = true;
        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef]);

    return {ref: flatListRef, scrollToIndex, scrollToBottom, isAutomaticScrollToBottom};
}

export default useReportScrollManager;
