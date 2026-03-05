import {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef} = useContext(ActionListContext);

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
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = () => {
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
    };

    const scrollToOffset = (offset: number) => {
        if (!flatListRef?.current) {
            return;
        }
        flatListRef.current.scrollToOffset({offset, animated: false});
    };

    return {ref: flatListRef, scrollToIndex, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
