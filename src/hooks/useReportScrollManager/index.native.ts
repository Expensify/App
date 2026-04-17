import {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {getListRef, scrollPositionRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     */
    const scrollToIndex = (index: number) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }
        listRef.current.scrollToIndex({index});
    };

    /**
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    const scrollToBottom = () => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }

        scrollPositionRef.current = {offset: 0};
        listRef.current?.scrollToOffset({animated: false, offset: 0});
    };

    /**
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = () => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }

        const scrollViewRef = listRef.current.getNativeScrollRef?.() as ScrollView | undefined;
        // Try to scroll on underlying scrollView if available, fallback to usual listRef
        if (scrollViewRef && typeof scrollViewRef.scrollToEnd === 'function') {
            scrollViewRef.scrollToEnd({animated: false});
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

    const scrollToIndexInstance = ({index, animated}: {index: number; animated: boolean}) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }
        listRef.current.scrollToIndex({index, animated});
    };

    return {scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset, scrollToIndexInstance};
}

export default useReportScrollManager;
