import {useContext} from 'react';
import ReportScreenContext from '../../pages/home/ReportScreenContext';

function useReportScrollManager() {
    const {flatListRef} = useContext(ReportScreenContext);

    /**
     * Scroll to the provided index.
     *
     * @param {Object} index
     */
    const scrollToIndex = (index) => {
        flatListRef.current.scrollToIndex(index);
    };

    /**
     * Scroll to the bottom of the flatlist.
     */
    const scrollToBottom = () => {
        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    };

    return {scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
