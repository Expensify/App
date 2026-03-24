import type {OnyxEntry} from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

// Commands that should trigger the LoadingBar to show
const RELEVANT_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT, WRITE_COMMANDS.READ_NEWEST_ACTION]);

const persistedRequestsSelector = (requests: OnyxEntry<AnyRequest[]>) => !!requests?.some((r) => RELEVANT_COMMANDS.has(r.command) && !r.initiatedOffline);

const ongoingRequestSelector = (request: OnyxEntry<AnyRequest>) => !!request && RELEVANT_COMMANDS.has(request.command);

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when any of the RELEVANT_COMMANDS are being processed
 */
export default function useLoadingBarVisibility(): boolean {
    const [hasRelevantPersistedRequests] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {selector: persistedRequestsSelector});
    const [hasRelevantOngoingRequest] = useOnyx(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, {selector: ongoingRequestSelector});
    const {isOffline} = useNetwork();

    // Don't show loading bar if currently offline
    if (isOffline) {
        return false;
    }

    return !!hasRelevantPersistedRequests || !!hasRelevantOngoingRequest;
}
