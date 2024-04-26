import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef} = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     * we are editing a comment.
     */
    const scrollToIndex = (index: number, isEditing?: boolean) => {
        if (!flatListRef?.current || isEditing) {
            return;
        }

        flatListRef.current.scrollToIndex({index, animated: true});
    };

    /**
     * Scroll to the bottom of the flatlist.
     */
    const scrollToBottom = useCallback(() => {
        // We're deferring execution here because on iOS: mWeb (WebKit based browsers)
        // scrollToOffset method doesn't work unless called on the next tick
        requestAnimationFrame(() => {
            if (!flatListRef?.current) {
                return;
            }

            flatListRef.current.scrollToOffset({animated: false, offset: 0});
        });
    }, [flatListRef]);

    return {ref: flatListRef, scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
