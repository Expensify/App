import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';

export default function reportWithoutHasDraftSelector(report: OnyxEntry<Report>) {
    if (!report) {
        return report;
    }
    const {hasDraft, ...reportWithoutHasDraft} = report;
    return reportWithoutHasDraft;
}
