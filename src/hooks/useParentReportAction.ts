import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getParentReportActionSelector} from '@selectors/ReportAction';
import {useCallback} from 'react';

import useOnyx from './useOnyx';

function useParentReportAction(report: OnyxEntry<Report>, isActive = true) {
    const getParentReportAction = useCallback(
        (parentReportActions: OnyxEntry<ReportActions>) => getParentReportActionSelector(parentReportActions, report?.parentReportActionID),
        [report?.parentReportActionID],
    );

    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    const [parentReportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        {
            selector: getParentReportAction,
            subscribed: isActive,
        },
        [getParentReportAction],
    );

    return parentReportAction;
}

export default useParentReportAction;
