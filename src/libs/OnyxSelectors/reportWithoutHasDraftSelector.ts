import {OnyxKeyValue} from '@src/ONYXKEYS';

export default function reportWithoutHasDraftSelector(report: OnyxKeyValue<'report_'>) {
    if (!report) {
        return report;
    }
    const {hasDraft, ...reportWithoutHasDraft} = report;
    return reportWithoutHasDraft;
}
