import {useContext} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {getListRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     */
    const scrollToIndex = (index: number, isEditing?: boolean) => {
        const listRef = getListRef();
        if (!listRef?.current || isEditing) {
            return;
        }

        listRef.current.scrollToIndex({index, animated: true});
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

        listRef.current.scrollToOffset({animated: false, offset: 0});
    };

    /**
     * Scroll to the end of the FlatList.
     */
    const scrollToEnd = () => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }

        listRef.current.scrollToEnd({animated: false});
    };

    const scrollToOffset = (offset: number) => {
        const listRef = getListRef();
        if (!listRef?.current) {
            return;
        }

        listRef.current.scrollToOffset({animated: true, offset});
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
