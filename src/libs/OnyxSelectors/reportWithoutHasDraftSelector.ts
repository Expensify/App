import type {OnyxValue} from '@src/ONYXKEYS';

export default function reportWithoutHasDraftSelector(report: OnyxValue<'report_'>) {
    if (!report) {
        return report;
    }
    const {hasDraft, ...reportWithoutHasDraft} = report;
    return reportWithoutHasDraft;
}
