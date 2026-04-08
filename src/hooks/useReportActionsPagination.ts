import {useRoute} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {getCombinedReportActions, getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useTransactionThread from './useTransactionThread';

type UseReportActionsPaginationResult = {
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    allReportActionIDs: string[];
    hasOlderActions: boolean;
    hasNewerActions: boolean;
    reportActionID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
    isReportTransactionThread: boolean;
};

function useReportActionsPagination(reportID: string | undefined): UseReportActionsPaginationResult {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionID = route?.params?.reportActionID;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isOffline} = useNetwork();

    const {reportActions: unfilteredReportActions, hasOlderActions, hasNewerActions} = usePaginatedReportActions(reportID, reportActionID);
    const allReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});

    const reportActions = getCombinedReportActions(allReportActions, thread.transactionThreadReportID ?? null, thread.transactionThreadReportActions ?? []);

    const allReportActionIDs = allReportActions.map((action) => action.reportActionID);

    return {
        reportActions,
        allReportActions,
        allReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        reportActionID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        isReportTransactionThread: thread.isReportTransactionThread,
    };
}

export default useReportActionsPagination;
