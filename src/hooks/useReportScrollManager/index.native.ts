import {useCallback, useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     */
    const scrollToIndex = useCallback(
        (index: number) => {
            if (!flatListRef?.current) {
                return;
            }

            flatListRef.current.scrollToIndex({index});
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

        setScrollPosition({offset: 0});

        flatListRef.current?.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef, setScrollPosition]);

    /**
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        const scrollViewRef = flatListRef.current.getNativeScrollRef();
        // Try to scroll on underlying scrollView if available, fallback to usual listRef
        if (scrollViewRef && 'scrollToEnd' in scrollViewRef) {
            (scrollViewRef as ScrollView).scrollToEnd({animated: false});
            return;
        }

        flatListRef.current.scrollToEnd({animated: false});
    }, [flatListRef]);

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToEnd};
}

export default useReportScrollManager;
