import {getParentReportActionSelector} from '@selectors/ReportAction';
import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useParentReportAction(report: OnyxEntry<Report>) {
    const getParentReportAction = useCallback(
        (parentReportActions: OnyxEntry<ReportActions>) => getParentReportActionSelector(parentReportActions, report?.parentReportActionID),
        [report?.parentReportActionID],
    );

    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    const [parentReportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        {
            selector: getParentReportAction,
        },
        [getParentReportAction],
    );

    return parentReportAction;
}

export default useParentReportAction;
