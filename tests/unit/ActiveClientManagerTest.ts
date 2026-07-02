import Onyx from 'react-native-onyx';
import type {Init, IsClientTheLeader, IsReady, PromoteToLeader} from '@libs/ActiveClientManager/types';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Load the web implementation explicitly. Jest defaults to the native platform, and the native
// ActiveClientManager is a no-op, so we must pin the `.ts` (web) file to exercise leader election.
const ActiveClientManager = jest.requireActual<{
    init: Init;
    isClientTheLeader: IsClientTheLeader;
    isReady: IsReady;
    promoteToLeader: PromoteToLeader;
}>('@libs/ActiveClientManager/index.ts');

const GHOST_GUID = 'ghost-guid-from-a-dead-tab';

// Persistent subscriber that always holds the latest ACTIVE_CLIENTS value (avoids connect/disconnect races).
let latestActiveClients: string[] | undefined;

// Learned from the first init() (which pushes our GUID last) and reused across tests.
let clientID: string;

beforeAll(async () => {
    Onyx.init({keys: ONYXKEYS});
    Onyx.connect({
        key: ONYXKEYS.ACTIVE_CLIENTS,
        callback: (value) => {
            latestActiveClients = value;
        },
    });
    ActiveClientManager.init();
    await ActiveClientManager.isReady();
    await waitForBatchedUpdates();
    clientID = latestActiveClients?.at(-1) ?? '';
});

describe('ActiveClientManager', () => {
    it('registers this client as the leader on init', () => {
        expect(clientID).not.toBe('');
        expect(latestActiveClients).toEqual([clientID]);
        expect(ActiveClientManager.isClientTheLeader()).toBe(true);
    });

    it('re-adds this client when a stale hydration event drops it (boot-race guard)', async () => {
        // Simulate a late disk-hydration overwrite that omits the live client and leaves only a ghost GUID.
        await Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, [GHOST_GUID]);
        await waitForBatchedUpdates();

        // The connect callback must re-append our GUID so the ghost can't hold leadership.
        expect(latestActiveClients).toEqual([GHOST_GUID, clientID]);
        expect(ActiveClientManager.isClientTheLeader()).toBe(true);
    });

    it('reclaims leadership via promoteToLeader when a ghost GUID holds the last slot', async () => {
        // Our GUID is present but a ghost sits last, so we are not the leader and the callback won't re-add us.
        await Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, [clientID, GHOST_GUID]);
        await waitForBatchedUpdates();
        expect(ActiveClientManager.isClientTheLeader()).toBe(false);

        ActiveClientManager.promoteToLeader();
        await waitForBatchedUpdates();

        expect(latestActiveClients?.at(-1)).toBe(clientID);
        expect(ActiveClientManager.isClientTheLeader()).toBe(true);
    });
});
