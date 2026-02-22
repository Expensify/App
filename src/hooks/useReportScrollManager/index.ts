import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(isInverted = true): ReportScrollManagerData {
    const {flatListRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     */
    const scrollToIndex = useCallback(
        (index: number, isEditing?: boolean) => {
            if (!flatListRef?.current || isEditing) {
                return;
            }

            flatListRef.current.scrollToIndex({index, animated: true});
        },
        [flatListRef],
    );

    /**
     * Scroll to the visual bottom of the list.
     */
    const scrollToBottom = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        if (isInverted) {
            flatListRef.current.scrollToOffset({animated: false, offset: 0});
            return;
        }

        flatListRef.current.scrollToEnd({animated: false});
    }, [flatListRef, isInverted]);

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
