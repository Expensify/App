import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(isInverted = true): ReportScrollManagerData {
    const {flatListRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     */
    const scrollToIndex = (index: number, isEditing?: boolean) => {
        if (!flatListRef?.current || isEditing) {
            return;
        }

        flatListRef.current.scrollToIndex({index, animated: true});
    };

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
    const scrollToEnd = () => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToEnd({animated: false});
    };

    const scrollToOffset = (offset: number) => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToOffset({animated: true, offset});
    };

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
