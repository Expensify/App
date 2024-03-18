import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';

type ReportWithoutHasDraft = Omit<Report, 'hasDraft'>;

export default function reportWithoutHasDraftSelector(report: OnyxEntry<Report>): OnyxEntry<ReportWithoutHasDraft> {
    if (!report) {
        return null;
    }
    const {hasDraft, ...reportWithoutHasDraft} = report;
    return reportWithoutHasDraft;
}

export type {ReportWithoutHasDraft};
