import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLoadingState} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

// Narrowed to the keys so other loading flags (e.g. OpenReport's isLoadingInitialReportActions) don't hand Search a new set and rebuild every row.
const actionLoadingReportKeysSelector = (reportLoadingStates: OnyxCollection<ReportLoadingState>) =>
    Object.keys(reportLoadingStates ?? {}).filter((key) => reportLoadingStates?.[key]?.isActionLoading);

function useActionLoadingReportIDs(): ReadonlySet<string> {
    const [actionLoadingReportKeys] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE, {selector: actionLoadingReportKeysSelector});

    return new Set(actionLoadingReportKeys);
}

export default useActionLoadingReportIDs;
