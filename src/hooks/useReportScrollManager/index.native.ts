import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     * @param viewPosition (optional) - `0`: top, `0.5`: center, `1`: bottom
     */
    // We're defaulting isEditing to false in order to match the
    // number of arguments that index.ts version has.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scrollToIndex = (index: number, isEditing = false, viewPosition?: number) => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToIndex({index, viewPosition});
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

    return {ref: flatListRef, scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
