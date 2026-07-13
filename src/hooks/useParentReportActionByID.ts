import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getParentReportActionSelector} from '@selectors/ReportAction';
import {useCallback} from 'react';

import useOnyx from './useOnyx';

function useParentReportActionByID(parentReportID?: string, parentReportActionID?: string) {
    const getParentReportAction = useCallback(
        (parentReportActions: OnyxEntry<ReportActions>) => getParentReportActionSelector(parentReportActions, parentReportActionID),
        [parentReportActionID],
    );

    const [parentReportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(parentReportID)}`,
        {
            selector: getParentReportAction,
        },
        [getParentReportAction],
    );

    return parentReportAction;
}

export default useParentReportActionByID;
