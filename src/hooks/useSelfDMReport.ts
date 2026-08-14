import DateUtils from '@libs/DateUtils';
import {buildOptimisticSelfDMReport, isSelfDM, isThread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

const selfDMReportIDSelector = (reports: OnyxCollection<Report>, cachedSelfDMReportID: string | undefined) => {
    if (cachedSelfDMReportID) {
        return undefined;
    }
    return Object.values(reports ?? {}).find((report) => isSelfDM(report) && !isThread(report))?.reportID;
};

type ResolvedSelfDMReport = {
    /** The real self DM report, `undefined` while it is still loading or when the account has none yet. */
    selfDMReport: OnyxEntry<Report>;

    /** Whether the Onyx values the lookup depends on are still being read. */
    isLoading: boolean;
};

function useResolvedSelfDMReport(): ResolvedSelfDMReport {
    const [cachedSelfDMReportID, cachedSelfDMReportIDResult] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportID, selfDMReportIDResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => selfDMReportIDSelector(reports, cachedSelfDMReportID)});
    const [selfDMReport, selfDMReportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${cachedSelfDMReportID ?? selfDMReportID}`);
    return {selfDMReport, isLoading: isLoadingOnyxValue(cachedSelfDMReportIDResult, selfDMReportIDResult, selfDMReportResult)};
}

function useSelfDMReport() {
    const {selfDMReport} = useResolvedSelfDMReport();
    return selfDMReport ?? buildOptimisticSelfDMReport(DateUtils.getDBTime());
}

export {useResolvedSelfDMReport};
export type {ResolvedSelfDMReport};
export default useSelfDMReport;
