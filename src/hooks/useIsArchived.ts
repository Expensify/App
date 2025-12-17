import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import useOnyx from './useOnyx';

function isArchivedSelector(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) {
    return !!reportNameValuePairs?.private_isArchived;
}

function useIsArchived(reportID: string) {
    const [isArchived] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true, selector: isArchivedSelector});

    return isArchived;
}

export default useIsArchived;
