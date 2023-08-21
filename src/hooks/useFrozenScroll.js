import {useContext} from 'react';
import {ReportActionListFrozenScrollContext} from "../pages/home/report/ReportActionListFrozenScrollContext";

/**
 * Hook for getting current state of scroll freeze and a function to set whether the scroll should be frozen
 * @returns {Object}
 */
export default function useFrozenScroll() {
    return useContext(ReportActionListFrozenScrollContext);
}
