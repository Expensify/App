import useKeyboardState from '@hooks/useKeyboardState';

import {useActionListContext} from '@pages/inbox/ActionListContext';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';

import type ReportScrollManagerData from './types';

import nativeScrollToBottomHandler from './handlers/nativeScrollToBottomHandler';
import scrollToOffsetHandler from './handlers/scrollToOffset';

function useReportScrollManager(): ReportScrollManagerData {
    const {getListRef} = useActionListContext();
    const {isKeyboardActive, keyboardHeight} = useKeyboardState();

    /**
     * Scroll to the provided index. `isEditing` is accepted for signature parity with the web
     * implementation but is a no-op here, matching the previous native behavior. `animated`
     * defaults to `false` to match FlashList's default (the previous native call omitted it).
     */
    const scrollToIndex = (index: number, {animated = false}: {isEditing?: boolean; animated?: boolean} = {}) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }
        listRef.current.scrollToIndex({index, animated});
    };

    /**
     * Scroll to the bottom of the inverted FlatList.
     * When FlatList is inverted it's "bottom" is really it's top
     */
    const scrollToBottom = () => {
        const listRef = getListRef();
        nativeScrollToBottomHandler({listRef, isKeyboardActive, keyboardHeight});
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
        scrollToOffsetHandler({listRef, isKeyboardActive, keyboardHeight, offset});
    };

    return {scrollToIndex, scrollToBottom, scrollToEnd, scrollToOffset};
}

export default useReportScrollManager;
