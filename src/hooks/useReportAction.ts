import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getReportActionByIDSelector} from '@selectors/ReportAction';

import useOnyx from './useOnyx';

/**
 * Reads one action of a report by its ID. The selector keeps only that action, so the caller re-renders when it
 * changes and not when other actions of the same report do.
 */
function useReportAction(reportID: string | undefined, reportActionID: string | undefined): OnyxEntry<ReportAction> {
    const selectReportAction = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, reportActionID);
    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: selectReportAction});

    return reportAction;
}

export default useReportAction;
