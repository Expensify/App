import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);

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

        setScrollPosition({offset: 0});

        flatListRef.current?.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef, setScrollPosition]);

    /**
     * Scroll to the offset of the flatlist.
     */
    const scrollToOffsetWithoutAnimation = useCallback(
        (offset: number) => {
            if (!flatListRef?.current) {
                return;
            }

            flatListRef.current.scrollToOffset({animated: false, offset});
        },
        [flatListRef],
    );

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToOffsetWithoutAnimation};
}

export default useReportScrollManager;
