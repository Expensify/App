import {useContext, useCallback} from 'react';
import {ActionListContext, ActionListContextType} from '../../pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: ActionListContextType;
    scrollToIndex: (index: number) => void;
    scrollToBottom: () => void;
};

function useReportScrollManager(): ReportScrollManagerData {
    const flatListRef = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     *
     */
    const scrollToIndex = (index: number) => {
        if (!flatListRef?.current) {
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
