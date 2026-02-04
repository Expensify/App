import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useChildReport(reportAction: OnyxEntry<ReportAction>): OnyxEntry<Report> {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`, {canBeMissing: true});
    return report;
}

export default useChildReport;
