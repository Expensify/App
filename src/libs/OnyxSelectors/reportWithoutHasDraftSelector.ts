import {OnyxKeyValue} from '@src/ONYXKEYS';

export default function reportWithoutHasDraftSelector(report: OnyxKeyValue<'report_'>) {
    if (!report) {
        return report;
    }
    const {hasDraft, ...reportWithoutHasDraft} = report;
    const {lastVisitTime, ...reportWithoutHasDraftAndLastVisitTime} = reportWithoutHasDraft;
    return reportWithoutHasDraftAndLastVisitTime;
}
