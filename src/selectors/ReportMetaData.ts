import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReportMetadata} from '@src/types/onyx';

const isActionLoadingSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isActionLoading ?? false;

const isActionLoadingSetSelector = (all: OnyxCollection<ReportMetadata>): ReadonlySet<string> => {
    const ids = new Set<string>();
    if (!all) {
        return ids;
    }

    for (const [key, value] of Object.entries(all)) {
        if (value?.isActionLoading) {
            ids.add(key);
        }
    }
    return ids;
};

export {isActionLoadingSelector, isActionLoadingSetSelector};
