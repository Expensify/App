import {useCallback, useContext} from 'react';
import {Platform} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import useKeyboardState from '@hooks/useKeyboardState';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import scrollToBottomHandler from './scrollToBottomHandler';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);
    const {isKeyboardActive, keyboardHeight} = useKeyboardState();

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
    const scrollToBottom = useCallback(
        () => scrollToBottomHandler({flatListRef, isKeyboardActive, keyboardHeight, setScrollPosition}),
        [flatListRef, setScrollPosition, isKeyboardActive, keyboardHeight],
    );

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

    const scrollToOffset = useCallback(
        (offset: number) => {
            if (!flatListRef?.current) {
                return;
            }

            if (Platform.OS === 'ios' && isKeyboardActive) {
                flatListRef.current?.scrollToOffset({animated: false, offset: offset - keyboardHeight});
                return;
            }

            flatListRef.current.scrollToOffset({offset, animated: false});
        },
        [flatListRef, isKeyboardActive, keyboardHeight],
    );

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
