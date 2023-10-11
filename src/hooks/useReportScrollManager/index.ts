import {useContext, useCallback} from 'react';
import {ActionListContext, ActionListContextType} from '../../pages/home/ReportScreenContext';

function useReportScrollManager(): {
    ref: ActionListContextType;
    scrollToIndex: (index: number, isEditing: boolean) => void;
    scrollToBottom: () => void;
} {
    const flatListRef = useContext(ActionListContext);

    /**
     * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
     * we are editing a comment.
     *
     */
    const scrollToIndex = (index: number, isEditing: boolean) => {
        if (!flatListRef?.current || isEditing) {
            return;
        }

        flatListRef.current.scrollToIndex({index});
    };

    /**
     * Scroll to the bottom of the flatlist.
     */
    const scrollToBottom = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef]);

    return {ref: flatListRef, scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
