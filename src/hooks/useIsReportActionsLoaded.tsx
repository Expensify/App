import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasOnceLoadedReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {ReportActions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

function hasReportActionsSelector(reportActions: OnyxEntry<ReportActions>) {
    return !isEmptyObject(reportActions);
}

function useIsReportActionsLoaded(reportID: string | undefined) {
    const [hasOnceLoadedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`, {selector: hasOnceLoadedReportActionsSelector});
    const [hasReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: hasReportActionsSelector});
    return !!hasOnceLoadedReportActions || !!hasReportActions;
}

export default useIsReportActionsLoaded;
