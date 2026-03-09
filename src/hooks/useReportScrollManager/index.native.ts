import {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import useKeyboardState from '@hooks/useKeyboardState';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import scrollToBottomHandler from './handlers/scrollToBottom';
import scrollToOffsetHandler from './handlers/scrollToOffset';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, scrollPositionRef} = useContext(ActionListContext);
    const {isKeyboardActive, keyboardHeight} = useKeyboardState();

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
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    const scrollToBottom = () => scrollToBottomHandler({flatListRef, isKeyboardActive, keyboardHeight, scrollPositionRef});

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

    const scrollToOffset = (offset: number) => scrollToOffsetHandler({flatListRef, isKeyboardActive, keyboardHeight, offset});

    return {ref: flatListRef, scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
