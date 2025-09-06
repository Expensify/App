import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     */
    const scrollToIndex = useCallback(
        (index: number, isEditing?: boolean, viewPosition?: number) => {
            if (!flatListRef?.current || isEditing) {
                return;
            }

            flatListRef.current.scrollToIndex({index, animated: true, viewPosition});
        },
        [flatListRef],
    );

    /**
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    const scrollToBottom = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef]);

    /**
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToEnd({animated: false});
    }, [flatListRef]);

    const scrollToOffset = useCallback(
        (offset: number) => {
            if (!flatListRef?.current) {
                return;
            }

            flatListRef.current.scrollToOffset({animated: true, offset});
        },
        [flatListRef],
    );

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
