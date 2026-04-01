import {useContext} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
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
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    const scrollToBottom = () => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    };

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
