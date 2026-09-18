import useOnyx from '@hooks/useOnyx';

import {getReportLayoutGroupBy, getReportLayoutSelection, setReportLayout} from '@libs/actions/ReportLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useState} from 'react';

type UseMoneyRequestReportLayoutResult = {
    /** The layout selection currently shown to the user (latched click or the Onyx value) */
    currentSelection: OnyxTypes.ReportLayoutSelection;

    /** The attribute transactions are grouped by while grouping is on */
    currentGroupBy: OnyxTypes.ReportLayoutGroupBy;

    /** Whether the transactions should be rendered in groups */
    shouldGroupTransactions: boolean;

    /** Persists a layout selection and latches it locally until Onyx settles */
    selectLayout: (selection: OnyxTypes.ReportLayoutSelection) => void;
};

/**
 * Owns the report-layout (group-by) selection: reads the two NVPs, exposes the effective selection and
 * grouping mode, and persists user picks.
 *
 * Latches the user's most recent selection so the popover label and grouping mode never flick through the
 * (layoutOption=null, groupByOption=null) → CATEGORY default while the two NVPs settle in separate render passes.
 * Drops the latch once Onyx reaches the clicked value, so later authoritative updates (failureData rollback,
 * another client changing the layout) flow through instead of staying masked by stale local state.
 */
function useMoneyRequestReportLayout(shouldShowGroupedTransactions: boolean): UseMoneyRequestReportLayoutResult {
    const [reportLayoutGroupBy] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY);
    const [reportLayoutOption] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_OPTION);
    const [pendingLayoutSelection, setPendingLayoutSelection] = useState<OnyxTypes.ReportLayoutSelection | null>(null);

    const onyxLayoutSelection = getReportLayoutSelection(reportLayoutOption, reportLayoutGroupBy);
    const currentSelection: OnyxTypes.ReportLayoutSelection = pendingLayoutSelection ?? onyxLayoutSelection;

    useEffect(() => {
        if (pendingLayoutSelection === null || pendingLayoutSelection !== onyxLayoutSelection) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the click latch to Onyx so subsequent authoritative updates aren't masked by stale local state
        setPendingLayoutSelection(null);
    }, [pendingLayoutSelection, onyxLayoutSelection]);

    const isLayoutMatrixSelected = currentSelection === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
    const currentGroupBy: OnyxTypes.ReportLayoutGroupBy = currentSelection !== CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX ? currentSelection : getReportLayoutGroupBy(reportLayoutGroupBy);
    const shouldGroupTransactions = shouldShowGroupedTransactions && !isLayoutMatrixSelected;

    const selectLayout = (selection: OnyxTypes.ReportLayoutSelection) => {
        setPendingLayoutSelection(selection);
        setReportLayout(selection, reportLayoutOption, reportLayoutGroupBy);
    };

    return {
        currentSelection,
        currentGroupBy,
        shouldGroupTransactions,
        selectLayout,
    };
}

export default useMoneyRequestReportLayout;
