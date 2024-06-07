import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     */
    const scrollToIndex = useCallback(
        // We're defaulting isEditing to false to match the number of arguments of index.ts function version.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (index: number, isEditing = false, viewPosition?: number) => {
            if (!flatListRef?.current) {
                return;
            }

            flatListRef.current.scrollToIndex({index, viewPosition});
        },
        [flatListRef],
    );

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

    return {ref: flatListRef, scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
