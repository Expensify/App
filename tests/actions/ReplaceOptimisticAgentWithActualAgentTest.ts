import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';

import {registerAgentAccountIDMapping, resolveAgentAccountID} from '@libs/AgentAccountIDMapping';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import replaceOptimisticAgentAccountID from '@libs/Middleware/ReplaceOptimisticAgentAccountID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type * as NavigationModule from '@libs/Navigation/Navigation';
import type * as PersonalDetailsStoreModule from '@libs/PersonalDetailsStore';

import {deleteAgent} from '@userActions/Agent';
import {clear as clearPersistedRequests, getAll as getPersistedRequests, save as savePersistedRequest} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import type * as ReplaceOptimisticAgentWithActualAgentModule from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import {replaceOptimisticAgentWithActualAgent} from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {AnyRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {NavigationState, PartialState} from '@react-navigation/native';
// Default type import only: a namespace import would pull in the restricted `useOnyx` name
import type OnyxDefault from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type * as GetOnyxValueModule from '../utils/getOnyxValue';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type Navigation = typeof NavigationModule.default;

const mockSetParams = jest.fn<ReturnType<Navigation['setParams']>, Parameters<Navigation['setParams']>>();
const mockIsNavigationReady = jest.fn<Promise<void>, []>(() => Promise.resolve());
const mockIsReady = jest.fn(() => false);
const mockGetRootState = jest.fn<PartialState<NavigationState> | undefined, []>(() => undefined);

jest.mock('@libs/Navigation/Navigation', () => {
    const mockNavigation = {
        setParams: (...args: Parameters<Navigation['setParams']>): ReturnType<Navigation['setParams']> => mockSetParams(...args),
        isNavigationReady: () => mockIsNavigationReady(),
        navigationRef: {
            isReady: () => mockIsReady(),
            getRootState: () => mockGetRootState(),
        },
    };

    return {
        __esModule: true,
        ...mockNavigation,
        default: mockNavigation,
    };
});

// deleteAgent only builds its Onyx data and hands it to write(), so the request itself is never sent. A factory keeps the
// real API module, and the native modules its logging needs, out of this test.
jest.mock('@libs/API', () => ({write: jest.fn(), read: jest.fn()}));
const mockWrite = jest.mocked(write);

const mockSubscribeToPersonalDetails = jest.fn();
const mockUnsubscribeFromPersonalDetails = jest.fn();

// The store stays real. Its subscriptions are counted because they are the only sign of a skipped cleanup that is kept
// for a retry, which must cost nothing once there is nothing left to clear.
jest.mock('@libs/PersonalDetailsStore', () => {
    const actualStore = jest.requireActual<typeof PersonalDetailsStoreModule>('@libs/PersonalDetailsStore');
    return {
        ...actualStore,
        subscribeToPersonalDetails: (listener: () => void) => {
            mockSubscribeToPersonalDetails();
            const unsubscribe = actualStore.subscribeToPersonalDetails(listener);
            return () => {
                mockUnsubscribeFromPersonalDetails();
                unsubscribe();
            };
        },
    };
});

function buildAgentEditNavigationState(accountID: number): PartialState<NavigationState> {
    return {
        key: 'root-stack-key',
        index: 0,
        routes: [
            {
                key: 'settings-navigator-route-key',
                name: 'SettingsSplitNavigator',
                state: {
                    key: 'agent-settings-stack-key',
                    index: 0,
                    routes: [{key: 'agents-edit-route-key', name: SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT, params: {accountID: String(accountID)}}],
                },
            },
        ],
    };
}

// CreateAgent's response adds the real agent's record and personal details, with the login only the server assigns. A tab
// only redirects and cleans up once its own cache holds both, so tests of the cleanup seed them first.
function buildRealAgentPersonalDetail(accountID: number) {
    return {accountID, displayName: 'Created agent', login: `agent+${accountID}@expensify.com`};
}

async function addRealAgents(...realAccountIDs: number[]) {
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, Object.fromEntries(realAccountIDs.map((accountID) => [accountID, buildRealAgentPersonalDetail(accountID)])));
    await Promise.all(realAccountIDs.map((accountID) => Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, {prompt: 'Created instructions'})));
}

// The agent as createAgent() leaves it in this tab until CreateAgent's response arrives.
async function addOptimisticAgent(optimisticAccountID: number) {
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true}});
    await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
    await waitForBatchedUpdates();
}

// CreateAgent's response and success data, as the tab that applies them writes them: the real agent in, the temporary
// personal detail out, in one personal details write.
function applyCreateAgentResponse(optimisticAccountID: number, realAccountID: number) {
    return Onyx.update([
        {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: {[realAccountID]: buildRealAgentPersonalDetail(realAccountID), [optimisticAccountID]: null}},
        {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, value: {prompt: 'Book my flights'}},
    ]);
}

function getLastDeleteAgentOnyxData() {
    const onyxData = mockWrite.mock.calls.at(-1)?.[2];
    if (!onyxData) {
        throw new Error('deleteAgent did not call write with its Onyx data');
    }
    return onyxData;
}

// Deletes the agent before CreateAgent's response, so the request is built for the optimistic accountID, and returns it
// as the queue sends it: rewritten by the middleware once that response's mapping arrives.
async function queueDeletionBeforeCreateAgentResponse(optimisticAccountID: number, realAccountID: number): Promise<AnyRequest> {
    deleteAgent(optimisticAccountID, undefined, undefined, false);
    expect(mockWrite).toHaveBeenLastCalledWith(WRITE_COMMANDS.DELETE_AGENT, {agentAccountID: optimisticAccountID}, expect.any(Object));
    const deleteOnyxData = getLastDeleteAgentOnyxData();
    await Onyx.update(deleteOnyxData.optimisticData ?? []);
    await clearPersistedRequests();
    await savePersistedRequest({command: WRITE_COMMANDS.DELETE_AGENT, data: {agentAccountID: optimisticAccountID}, ...deleteOnyxData});
    await waitForBatchedUpdates();

    // The server sends the mapping twice in CreateAgent's response.
    const mappingUpdate = {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, value: {[optimisticAccountID]: realAccountID}};
    const createAgentResponse: Response<typeof ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING> = {jsonCode: 200, onyxData: [mappingUpdate, mappingUpdate]};
    await replaceOptimisticAgentAccountID(Promise.resolve(createAgentResponse), {command: WRITE_COMMANDS.CREATE_AGENT, data: {optimisticAccountID: String(optimisticAccountID)}}, true);
    const rewrittenRequest = getPersistedRequests().at(0);
    if (!rewrittenRequest) {
        throw new Error('The DeleteAgent request was not queued');
    }
    expect(rewrittenRequest.data?.agentAccountID).toBe(realAccountID);
    await clearPersistedRequests();
    return rewrittenRequest;
}

describe('replaceOptimisticAgentWithActualAgent', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    // The module keeps an in-memory record of consumed mappings that is never reset, so each test uses its own
    // accountIDs to stay independent. Optimistic agent accountIDs are generated like reportIDs (long random digit
    // sequences), hence the long literals.
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockIsNavigationReady.mockReset();
        mockIsNavigationReady.mockImplementation(() => Promise.resolve());
        mockIsReady.mockReturnValue(false);
        mockGetRootState.mockReturnValue(undefined);
        mockSetParams.mockClear();
        mockSubscribeToPersonalDetails.mockClear();
        mockUnsubscribeFromPersonalDetails.mockClear();
    });

    it('remaps the DM participants from the optimistic accountID to the real one', async () => {
        // Given a DM whose participants still contain the optimistic agent accountID
        const optimisticAccountID = 5738294610573829;
        const realAccountID = 8321047592837465;
        const ownerAccountID = 31415926;
        const reportID = '4823958472039485';

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {
                [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
        });
        await addRealAgents(realAccountID);
        await waitForBatchedUpdates();

        // When the optimistic agent is replaced with the real one
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the optimistic participant is copied onto the real accountID and the optimistic key is removed
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(report?.participants).toStrictEqual({
            [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        });
    });

    it('leaves a report the backend already swapped untouched', async () => {
        // Given a DM the server response already remapped to the real accountID
        const optimisticAccountID = 6947382910564738;
        const realAccountID = 2058371649283746;
        const reportID = '7364859201746385';

        const swappedReport = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {
                [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY},
            },
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, swappedReport);
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(report).toStrictEqual(swappedReport);
    });

    it('batches replacements and updates each report once without overwriting real participants', async () => {
        // Given two pending agents share a report that already contains authoritative details for one real participant
        const firstOptimisticID = 7012345678901234;
        const secondOptimisticID = 7012345678901235;
        const firstRealID = 11001;
        const secondRealID = 11002;
        const reportID = '7012345678901236';
        const realParticipant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
        const optimisticParticipant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN};
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            participants: {[firstOptimisticID]: optimisticParticipant, [secondOptimisticID]: optimisticParticipant, [firstRealID]: realParticipant},
        });
        await addRealAgents(firstRealID, secondRealID);
        await waitForBatchedUpdates();
        const mergeSpy = jest.spyOn(Onyx, 'merge');
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockClear();

        // When both mappings arrive together, report repair should be batched rather than repeated per agent
        replaceOptimisticAgentWithActualAgent(firstOptimisticID, firstRealID);
        replaceOptimisticAgentWithActualAgent(secondOptimisticID, secondRealID);
        await waitForBatchedUpdates();

        // Then one navigation pass and one report update preserve the server-provided participant
        expect(mockGetRootState).toHaveBeenCalledTimes(1);
        expect(mergeSpy.mock.calls.filter(([key]) => key === `${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toHaveLength(1);
        expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.participants).toStrictEqual({
            [firstRealID]: realParticipant,
            [secondRealID]: optimisticParticipant,
        });
        mergeSpy.mockRestore();
    });

    it('changes nothing when invoked a second time after a successful remap', async () => {
        const optimisticAccountID = 8172635409182736;
        const realAccountID = 3746158290374615;
        const reportID = '5647382910564738';

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {
                [optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [optimisticAccountID]: {displayName: 'Concierge Travel', isOptimisticPersonalDetail: true},
        });
        await addRealAgents(realAccountID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Book my flights'});
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const reportAfterFirstRun = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        const personalDetailsAfterFirstRun = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        const promptAfterFirstRun = await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`);

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toStrictEqual(reportAfterFirstRun);
        expect(await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST)).toStrictEqual(personalDetailsAfterFirstRun);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toStrictEqual(promptAfterFirstRun);
    });

    it('removes the temporary agent record without carrying its stale state onto the real agent, leaving the personal details list as it was', async () => {
        // Given the real personal detail and prompt as the server sent them, next to the optimistic copies still holding
        // the markers of an UpdateAgentAvatar and an UpdateAgentPrompt that were queued against the optimistic agent.
        // Those requests were rewritten to the real accountID by the middleware and completed before the mapping
        // reached Onyx (write responses are only flushed once the queue drains), so the markers are stale.
        const optimisticAccountID = 1029384756102938;
        const realAccountID = 8473625190847362;
        const errorTimestamp = '1725148800000000';
        const realPersonalDetail = {
            accountID: realAccountID,
            displayName: 'Concierge Travel',
            login: 'agent+8473625190847362@expensify.com',
            avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/real.png',
            avatarThumbnail: 'https://d1wpcgnaa73g0y.cloudfront.net/real_128.png',
        };
        const realAgentPrompt = {prompt: 'Book my flights and hotels'};
        const optimisticPersonalDetail = {
            accountID: optimisticAccountID,
            displayName: 'Concierge Travel',
            isOptimisticPersonalDetail: true,
            avatar: 'blob:https://new.expensify.com/1029384756102938',
            avatarThumbnail: 'blob:https://new.expensify.com/1029384756102938',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            pendingFields: {avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            errorFields: {avatar: {[errorTimestamp]: 'Unexpected error updating the avatar'}},
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: realPersonalDetail, [optimisticAccountID]: optimisticPersonalDetail});
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, realAgentPrompt);
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {
            prompt: 'Book my flights and hotels',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errors: {[errorTimestamp]: 'Unexpected error updating the prompt'},
        });
        await waitForBatchedUpdates();

        // When the mapping written by CreateAgent's success response is consumed
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then the real agent keeps exactly the server's data and the temporary agent record is gone. The personal details
        // list is left alone: CreateAgent's success data removes the temporary entry in the response's own write, and any
        // other write of that list would save it whole from this tab's cache. The mapping remains available to other tabs.
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(realPersonalDetail);
        expect(personalDetails?.[optimisticAccountID]).toStrictEqual(optimisticPersonalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toStrictEqual(realAgentPrompt);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBe(realAccountID);
    });

    it('clears every agent record when a deletion queued while CreateAgent was in flight succeeds', async () => {
        // Given an agent deleted before CreateAgent's response, so deleteAgent built the request for the optimistic
        // accountID, and the middleware rewrote the queued DeleteAgent to the real accountID when that response arrived
        const optimisticAccountID = 3948576102394857;
        const realAccountID = 6158293047615829;
        await addOptimisticAgent(optimisticAccountID);
        const deleteRequest = await queueDeletionBeforeCreateAgentResponse(optimisticAccountID, realAccountID);

        // When the queue drains: CreateAgent's response adds the real agent, DeleteAgent's success removes it, and then the
        // mapping reaches this tab
        await applyCreateAgentResponse(optimisticAccountID, realAccountID);
        await Onyx.update(deleteRequest.successData ?? []);
        await waitForBatchedUpdates();
        mockSubscribeToPersonalDetails.mockClear();
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then neither agent is left and nothing is kept for a retry. The cleanup needs the real agent's record and details,
        // which the deletion removed, so only the successful deletion can clear the optimistic agent.
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toBeUndefined();
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect(mockSubscribeToPersonalDetails).not.toHaveBeenCalled();
    });

    it('keeps the real agent with its error when a deletion queued while CreateAgent was in flight fails', async () => {
        // Given an agent deleted before CreateAgent's response, with the queued DeleteAgent rewritten to the real accountID
        const optimisticAccountID = 3948576102394858;
        const realAccountID = 6158293047615830;
        await addOptimisticAgent(optimisticAccountID);
        const deleteRequest = await queueDeletionBeforeCreateAgentResponse(optimisticAccountID, realAccountID);

        // When the queue drains with DeleteAgent's failure and the mapping reaches this tab
        await applyCreateAgentResponse(optimisticAccountID, realAccountID);
        await Onyx.update(deleteRequest.failureData ?? []);
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the real agent, which still exists on the server, stays with its error. CreateAgent's response removed the
        // temporary personal detail, and this tab removes the temporary agent record because its cache holds the real agent.
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(buildRealAgentPersonalDetail(realAccountID));
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        const realAgent = await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`);
        expect(realAgent?.errors).toBeTruthy();
        expect(realAgent?.pendingAction).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
    });

    it('redirects every agent settings screen in the navigation stack to the real accountID, skipping unrelated screens', async () => {
        // Given a navigation state with a focused agent EDIT_NAME screen, an agent EDIT screen buried beneath it,
        // and an unrelated screen that happens to carry the same accountID param
        const optimisticAccountID = 7261534980726153;
        const realAccountID = 4059687231405968;

        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue({
            key: 'root-stack-key',
            index: 0,
            routes: [
                {
                    key: 'settings-navigator-route-key',
                    name: 'SettingsSplitNavigator',
                    state: {
                        key: 'agent-settings-stack-key',
                        index: 1,
                        routes: [
                            {key: 'agents-edit-route-key', name: SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT, params: {accountID: String(optimisticAccountID)}},
                            {key: 'agents-edit-name-route-key', name: SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME, params: {accountID: String(optimisticAccountID)}},
                        ],
                    },
                },
                {key: 'unrelated-profile-route-key', name: SCREENS.DYNAMIC_PROFILE, params: {accountID: String(optimisticAccountID)}},
            ],
        });

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then only the two agent settings routes are redirected, each targeting its owning navigator's state key
        expect(mockSetParams).toHaveBeenCalledTimes(2);
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-name-route-key', 'agent-settings-stack-key');
    });

    it.each([
        {basePath: ROUTES.SETTINGS_AGENTS, optimisticAccountID: 7701234567890123, realAccountID: 15001},
        {basePath: ROUTES.WORKSPACE_AGENTS.getRoute('test-policy'), optimisticAccountID: 7701234567890124, realAccountID: 15002},
    ])('preserves the router parameter type for Back to $basePath', async ({basePath, optimisticAccountID, realAccountID}) => {
        // Given the real route parser supplies the parent that Back/Save will look for
        const backPath = createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(realAccountID), basePath);
        const parsedParent = findFocusedRouteWithOnyxTabGuard(getStateFromPath(backPath));
        const parsedAccountID = parsedParent?.params && 'accountID' in parsedParent.params ? parsedParent.params.accountID : undefined;
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));

        // When reconciliation updates the mounted agent route
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then strict route comparison can reuse the parent instead of appending a duplicate Edit suffix
        expect(parsedParent?.name).toBe(SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT);
        expect(parsedAccountID).toBe(String(realAccountID));
        expect(mockSetParams).toHaveBeenCalledWith({accountID: parsedAccountID}, 'agents-edit-route-key', 'agent-settings-stack-key');
    });

    it('waits for navigation to be ready before redirecting and clearing the optimistic agent', async () => {
        // Given an app whose navigation container has not reported ready yet (e.g. a persisted mapping consumed during
        // app start) while the restored navigation state still shows the optimistic agent's EDIT screen
        const optimisticAccountID = 7081726354908172;
        const realAccountID = 2736459081273645;
        const navigationReady = Promise.withResolvers<void>();
        mockIsNavigationReady.mockReturnValue(navigationReady.promise);
        mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));

        const optimisticPersonalDetail = {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true};
        const optimisticAgentPrompt = {prompt: 'Book my flights'};
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: optimisticPersonalDetail});
        await addRealAgents(realAccountID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, optimisticAgentPrompt);
        await waitForBatchedUpdates();

        // When the mapping is consumed before navigation is ready
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then late callers already resolve to the real accountID, but neither the redirect nor the cleanup has run, so
        // the open screen is not stranded on a deleted key
        expect(resolveAgentAccountID(optimisticAccountID)).toBe(realAccountID);
        expect(mockSetParams).not.toHaveBeenCalled();
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toStrictEqual(optimisticPersonalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toStrictEqual(optimisticAgentPrompt);
        expect((await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBe(realAccountID);

        // When navigation becomes ready
        mockIsReady.mockReturnValue(true);
        navigationReady.resolve();
        await waitForBatchedUpdates();

        // Then the screen is redirected and only the temporary agent record is removed; the personal details list is
        // CreateAgent's to change
        expect(mockSetParams).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toStrictEqual(optimisticPersonalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect((await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBe(realAccountID);
    });

    it('resolveAgentAccountID returns the input unchanged for an accountID with no consumed mapping', () => {
        const unknownAccountID = 5501982736455019;

        expect(resolveAgentAccountID(unknownAccountID)).toBe(unknownAccountID);
    });

    it('resolveAgentAccountID returns the real accountID once the Onyx mapping has been consumed', async () => {
        const optimisticAccountID = 8695041372869504;
        const realAccountID = 1327465980132746;

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        expect(resolveAgentAccountID(optimisticAccountID)).toBe(realAccountID);
    });

    it('keeps the mapping after removing the temporary agent record, for a tab that reads storage later', async () => {
        const optimisticAccountID = 2837465910283746;
        const realAccountID = 6058172439605817;

        // Given storage as CreateAgent's response left it: the real agent and its details in, the temporary personal
        // detail already out, and the temporary agent record still there
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Test instructions'});
        await addRealAgents(realAccountID);
        await waitForBatchedUpdates();

        // When the mapping reaches this tab
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then the temporary agent record is removed. Cross-tab Onyx notifications carry keys, then read their latest
        // stored values, so a receiving tab may read only after the first tab has completed cleanup and never see the
        // temporary agent record; the mapping itself stays for it.
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBe(realAccountID);
    });

    it('leaves the real agent untouched and only clears the entry when the mapping maps an accountID to itself', async () => {
        // Given a real agent whose personal detail and prompt would be deleted if the identity mapping were consumed
        const accountID = 8102837465910283;
        const personalDetail = {accountID, displayName: 'Concierge Travel', login: 'agent+8102837465910283@expensify.com'};
        const agentPrompt = {prompt: 'Book my flights'};

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: personalDetail});
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, agentPrompt);
        await waitForBatchedUpdates();

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[accountID]: accountID});
        await waitForBatchedUpdates();

        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[accountID]).toStrictEqual(personalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`)).toStrictEqual(agentPrompt);
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[accountID]).toBeUndefined();
    });

    it('clears nothing but the entry when the mapping value is not a valid accountID', async () => {
        // Given optimistic state for two agents whose mapping entries hold unusable values
        const zeroMappedAccountID = 3746510928374651;
        const negativeMappedAccountID = 8615203947861520;
        const zeroMappedPersonalDetail = {accountID: zeroMappedAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true};
        const negativeMappedPersonalDetail = {accountID: negativeMappedAccountID, displayName: 'Concierge Hotels', isOptimisticPersonalDetail: true};
        const agentPrompt = {prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [zeroMappedAccountID]: zeroMappedPersonalDetail,
            [negativeMappedAccountID]: negativeMappedPersonalDetail,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${zeroMappedAccountID}`, agentPrompt);
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${negativeMappedAccountID}`, agentPrompt);
        await waitForBatchedUpdates();

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[zeroMappedAccountID]: 0, [negativeMappedAccountID]: -1});
        await waitForBatchedUpdates();

        // Then the optimistic data is kept and the unusable entries are gone from the mapping
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails).toStrictEqual({
            [zeroMappedAccountID]: zeroMappedPersonalDetail,
            [negativeMappedAccountID]: negativeMappedPersonalDetail,
        });
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${zeroMappedAccountID}`)).toStrictEqual(agentPrompt);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${negativeMappedAccountID}`)).toStrictEqual(agentPrompt);
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[zeroMappedAccountID]).toBeUndefined();
        expect(mapping?.[negativeMappedAccountID]).toBeUndefined();
        expect(resolveAgentAccountID(zeroMappedAccountID)).toBe(zeroMappedAccountID);
        expect(resolveAgentAccountID(negativeMappedAccountID)).toBe(negativeMappedAccountID);
    });

    it('keeps its screens and writes nothing while its cache does not hold the real agent yet', async () => {
        // Given a second browser tab that created the agent while another tab applied CreateAgent's response. Onyx's
        // cross-tab sync delivered the mapping, but not yet the personal details list holding the real agent, so this
        // tab still has the optimistic agent, its DM and an open EDIT screen for it.
        const optimisticAccountID = 5172839406517283;
        const realAccountID = 3846152907384615;
        const ownerAccountID = 16180339;
        const reportID = '9182736450918273';
        const optimisticPersonalDetail = {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true};
        const optimisticAgent = {prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        const participants = {
            [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        };

        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: optimisticPersonalDetail});
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, optimisticAgent);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID, type: CONST.REPORT.TYPE.CHAT, participants});
        await waitForBatchedUpdates();
        const mergeSpy = jest.spyOn(Onyx, 'merge');
        const updateSpy = jest.spyOn(Onyx, 'update');

        // When this tab receives the mapping
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then its screen stays on the temporary agent, which is the only one this tab can show, and it writes nothing
        expect(mockSetParams).not.toHaveBeenCalled();
        expect(resolveAgentAccountID(optimisticAccountID)).toBe(realAccountID);
        expect(mergeSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toStrictEqual(optimisticPersonalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toStrictEqual(optimisticAgent);
        expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.participants).toStrictEqual(participants);
        mergeSpy.mockRestore();
        updateSpy.mockRestore();
    });

    it('clears a skipped optimistic agent once the real agent record reaches this tab after its details', async () => {
        // Given a tab that received the mapping before the real agent's details, so it skipped the cleanup. The mapping is
        // not delivered again, and the tab that applied CreateAgent's response may close before its own cleanup.
        const optimisticAccountID = 5172839406517284;
        const realAccountID = 3846152907384616;
        const ownerAccountID = 16180339;
        const reportID = '9182736450918274';
        await addOptimisticAgent(optimisticAccountID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {
                [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
        });
        await waitForBatchedUpdates();
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));
        mockSubscribeToPersonalDetails.mockClear();
        mockUnsubscribeFromPersonalDetails.mockClear();
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();
        expect(mockSubscribeToPersonalDetails).toHaveBeenCalledTimes(1);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeDefined();
        const updateSpy = jest.spyOn(Onyx, 'update');

        // When the personal details list with the real agent, and without the temporary entry, reaches this tab first
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: buildRealAgentPersonalDetail(realAccountID), [optimisticAccountID]: null});
        await waitForBatchedUpdates();

        // Then the tab still waits, because the real agent's record is not here yet: its open screen keeps the temporary agent
        expect(updateSpy).not.toHaveBeenCalled();
        expect(mockUnsubscribeFromPersonalDetails).not.toHaveBeenCalled();
        expect(mockSetParams).not.toHaveBeenCalled();

        // When the real agent's record arrives after it
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {prompt: 'Created instructions'});
        await waitForBatchedUpdates();

        // Then the agent change ends the retry, without another mapping change or a reload: this tab moves its open screen to
        // the real agent, removes the temporary agent record and stops listening
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect(mockUnsubscribeFromPersonalDetails).toHaveBeenCalledTimes(1);

        // When an unrelated personal details change follows
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ownerAccountID]: {accountID: ownerAccountID, displayName: 'Owner'}});
        await waitForBatchedUpdates();

        // Then nothing more is written, the DM is repaired and the personal details are as the response left them
        expect(updateSpy).toHaveBeenCalledTimes(1);
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(personalDetails?.[realAccountID]).toStrictEqual(buildRealAgentPersonalDetail(realAccountID));
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect((await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`))?.participants).toStrictEqual({
            [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        });
        expect(mockUnsubscribeFromPersonalDetails).toHaveBeenCalledTimes(1);
        updateSpy.mockRestore();
    });

    it('clears a skipped optimistic agent when the real agent record arrives before its details, without writing the personal details list', async () => {
        // Given a tab that received the mapping before the real agent, so it skipped the cleanup and listens for changes
        const optimisticAccountID = 5172839406517287;
        const realAccountID = 3846152907384619;
        await addOptimisticAgent(optimisticAccountID);
        mockSubscribeToPersonalDetails.mockClear();
        mockUnsubscribeFromPersonalDetails.mockClear();
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();
        expect(mockSubscribeToPersonalDetails).toHaveBeenCalledTimes(1);
        const mergeSpy = jest.spyOn(Onyx, 'merge');
        const setSpy = jest.spyOn(Onyx, 'set');
        const updateSpy = jest.spyOn(Onyx, 'update');

        // When the real agent's record reaches this tab first
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {prompt: 'Created instructions'});
        await waitForBatchedUpdates();

        // Then the tab still waits, because the real agent's details are not here yet
        expect(updateSpy).not.toHaveBeenCalled();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeDefined();

        // When the personal details list with the real agent, and without the temporary entry, arrives after it
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: buildRealAgentPersonalDetail(realAccountID), [optimisticAccountID]: null});
        await waitForBatchedUpdates();

        // Then the personal details change ends the retry: the temporary agent record is removed and the tab stops
        // listening. The only personal details write is the one this test made, because every write of that list saves
        // it whole from this tab's cache and could drop another tab's newer entries.
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect(mockUnsubscribeFromPersonalDetails).toHaveBeenCalledTimes(1);
        expect(mergeSpy.mock.calls.filter(([key]) => key === ONYXKEYS.PERSONAL_DETAILS_LIST)).toHaveLength(1);
        expect(setSpy.mock.calls.filter(([key]) => key === ONYXKEYS.PERSONAL_DETAILS_LIST)).toHaveLength(0);
        expect(updateSpy.mock.calls.flatMap(([updates]) => updates).filter((update) => update.key === ONYXKEYS.PERSONAL_DETAILS_LIST)).toHaveLength(0);
        mergeSpy.mockRestore();
        setSpy.mockRestore();
        updateSpy.mockRestore();
    });

    it('stops retrying a skipped cleanup once another tab has cleared the optimistic agent', async () => {
        // Given a tab that skipped the cleanup because its cache did not hold the real agent yet
        const optimisticAccountID = 5172839406517285;
        const realAccountID = 3846152907384617;
        await addOptimisticAgent(optimisticAccountID);
        mockSubscribeToPersonalDetails.mockClear();
        mockUnsubscribeFromPersonalDetails.mockClear();
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();
        expect(mockSubscribeToPersonalDetails).toHaveBeenCalledTimes(1);
        const updateSpy = jest.spyOn(Onyx, 'update');

        // When another tab's cleanup reaches it before the real agent does, as after a successful deletion
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, null);
        await waitForBatchedUpdates();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
        await waitForBatchedUpdates();

        // Then it stops listening without writing anything, since there is nothing left to clear
        expect(mockUnsubscribeFromPersonalDetails).toHaveBeenCalledTimes(1);
        expect(updateSpy).not.toHaveBeenCalled();
        updateSpy.mockRestore();
    });

    it('keeps nothing for a retry when a mapping has no optimistic data left to clear', async () => {
        // Given a retained mapping of an agent deleted long ago: no optimistic data and no real agent in this tab
        const optimisticAccountID = 5172839406517286;
        const realAccountID = 3846152907384618;
        await addRealAgents(realAccountID + 1);
        await waitForBatchedUpdates();
        mockSubscribeToPersonalDetails.mockClear();

        // When the mapping is consumed
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the tab does not listen to personal details for it, so retained mappings cost nothing
        expect(mockSubscribeToPersonalDetails).not.toHaveBeenCalled();
    });

    it('clears an optimistic agent through the successful deletion when it was deleted after its real accountID was registered', async () => {
        // Given an agent deleted while another request kept the queue from draining after CreateAgent's response. The
        // middleware had already registered the real accountID, so DeleteAgent targets the real agent.
        const optimisticAccountID = 2864019375286401;
        const realAccountID = 7392018465739201;
        await addOptimisticAgent(optimisticAccountID);
        registerAgentAccountIDMapping(optimisticAccountID, realAccountID);
        deleteAgent(optimisticAccountID, undefined, undefined, false);
        const deleteOnyxData = getLastDeleteAgentOnyxData();
        await Onyx.update(deleteOnyxData.optimisticData ?? []);

        // When the queue drains: CreateAgent's response adds the real agent, DeleteAgent's success removes it again, and
        // then the mapping reaches this tab
        await applyCreateAgentResponse(optimisticAccountID, realAccountID);
        await Onyx.update(deleteOnyxData.successData ?? []);
        await waitForBatchedUpdates();
        mockSubscribeToPersonalDetails.mockClear();
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then neither agent is left and nothing is kept for a retry. The real agent's record and details the cleanup waits
        // for are gone, so the successful deletion clears the optimistic agent itself.
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(personalDetails?.[realAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toBeUndefined();
        expect(mockSubscribeToPersonalDetails).not.toHaveBeenCalled();
    });

    it('keeps the real agent with its error when a deletion after its real accountID was registered fails', async () => {
        // Given an agent deleted after the middleware registered its real accountID, so DeleteAgent targets the real agent
        const optimisticAccountID = 2864019375286402;
        const realAccountID = 7392018465739202;
        await addOptimisticAgent(optimisticAccountID);
        registerAgentAccountIDMapping(optimisticAccountID, realAccountID);
        deleteAgent(optimisticAccountID, undefined, undefined, false);
        const deleteOnyxData = getLastDeleteAgentOnyxData();
        await Onyx.update(deleteOnyxData.optimisticData ?? []);

        // When the queue drains with DeleteAgent's failure and the mapping reaches this tab
        await applyCreateAgentResponse(optimisticAccountID, realAccountID);
        await Onyx.update(deleteOnyxData.failureData ?? []);
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the real agent, which still exists on the server, stays with its error. CreateAgent's response removed the
        // temporary personal detail, and this tab removes the temporary agent record because its cache holds the real agent.
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(buildRealAgentPersonalDetail(realAccountID));
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        const realAgent = await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`);
        expect(realAgent?.errors).toBeTruthy();
        expect(realAgent?.pendingAction).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
    });

    it.each([
        {deletionState: 'in flight', optimisticAccountID: 2864019375286403, realAccountID: 7392018465739203, hasFailed: false},
        {deletionState: 'failed', optimisticAccountID: 2864019375286404, realAccountID: 7392018465739204, hasFailed: true},
    ])('writes nothing while only deleteAgent placeholders stand for the real agent and the deletion is $deletionState', async ({optimisticAccountID, realAccountID, hasFailed}) => {
        // Given a tab whose cache lags behind another tab's: it deleted the agent before the real agent's details from
        // CreateAgent's response reached it, so deleteAgent wrote nothing optimistic for the real agent. The failed case
        // checks that the placeholder deleteAgent's failure data writes, which has no login, does not open the gate.
        await addOptimisticAgent(optimisticAccountID);
        registerAgentAccountIDMapping(optimisticAccountID, realAccountID);
        deleteAgent(optimisticAccountID, undefined, undefined, false);
        const deleteOnyxData = getLastDeleteAgentOnyxData();
        await Onyx.update(deleteOnyxData.optimisticData ?? []);
        if (hasFailed) {
            await Onyx.update(deleteOnyxData.failureData ?? []);
        }
        await waitForBatchedUpdates();
        const personalDetailsBefore = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetailsBefore?.[realAccountID]).toStrictEqual(hasFailed ? {accountID: realAccountID} : undefined);
        const mergeSpy = jest.spyOn(Onyx, 'merge');
        const updateSpy = jest.spyOn(Onyx, 'update');

        // When this tab receives the mapping
        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then it writes nothing. Saving its personal details list would erase the real agent in every tab, and after a
        // failed deletion that agent still exists on the server.
        expect(mergeSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST)).toStrictEqual(personalDetailsBefore);
        mergeSpy.mockRestore();
        updateSpy.mockRestore();
    });

    // The module consumes a persisted mapping as soon as it loads, so the cold start is reproduced by seeding storage
    // (which outlives jest.resetModules()) and then loading the module against a fresh Onyx instance, the way
    // CloudflareSessionTest does. It stays last: the fresh instance never sees writes made through the imported one.
    describe('on app start', () => {
        it('consumes a persisted mapping once navigation is ready and the report collection has hydrated', async () => {
            // Given a session that was killed right after CreateAgent's response landed: the mapping and the real agent are
            // persisted, the response's write already removed the temporary personal detail, and the temporary agent record
            // and a DM still keyed by it remain while the restored navigation state shows its EDIT screen
            const optimisticAccountID = 6170293845617029;
            const realAccountID = 4958203716495820;
            const ownerAccountID = 27182818;
            const reportID = '3059817264305981';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                },
            });
            await addRealAgents(realAccountID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            await waitForBatchedUpdates();

            mockIsReady.mockReturnValue(true);
            mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));

            // When the app starts with the mapping already in storage
            jest.resetModules();
            const ColdStartOnyx = require<{default: typeof OnyxDefault}>('react-native-onyx').default;
            const coldStartOnyxKeys = require<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
            ColdStartOnyx.init({keys: coldStartOnyxKeys});
            // Written through the fresh instance so the module instance imported above cannot consume it first.
            await ColdStartOnyx.merge(coldStartOnyxKeys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
            await waitForBatchedUpdates();
            require<typeof ReplaceOptimisticAgentWithActualAgentModule>('@src/libs/actions/replaceOptimisticAgentWithActualAgent');
            const getColdStartOnyxValue = require<typeof GetOnyxValueModule>('../utils/getOnyxValue').default;
            await waitForBatchedUpdates();

            // Then the screen is redirected, the DM participants are repaired against the hydrated report collection,
            // and the temporary agent record is removed while the mapping remains available to other tabs
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
            const report = await getColdStartOnyxValue(`${coldStartOnyxKeys.COLLECTION.REPORT}${reportID}`);
            expect(report?.participants).toStrictEqual({
                [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            });
            expect(await getColdStartOnyxValue(`${coldStartOnyxKeys.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
            expect((await getColdStartOnyxValue(coldStartOnyxKeys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBe(realAccountID);
        });

        it.each([false, true])('retains completed mappings without cleanup writes and repairs orphan reports: %s', async (hasOrphanReport) => {
            // Given cleanup has removed temporary agent records, with or without an interrupted report repair
            const optimisticAccountID = hasOrphanReport ? 7123456789012345 : 7123456789012346;
            const realAccountID = hasOrphanReport ? 12001 : 12002;
            const secondOptimisticID = hasOrphanReport ? 7123456789012347 : 7123456789012348;
            const reportID = '7123456789012349';
            jest.resetModules();
            const ColdStartOnyx = require<{default: typeof OnyxDefault}>('react-native-onyx').default;
            const coldStartOnyxKeys = require<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
            ColdStartOnyx.init({keys: coldStartOnyxKeys});
            await ColdStartOnyx.clear();
            await ColdStartOnyx.multiSet({
                [coldStartOnyxKeys.PERSONAL_DETAILS_LIST]: {[realAccountID]: buildRealAgentPersonalDetail(realAccountID)},
                [coldStartOnyxKeys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[optimisticAccountID]: realAccountID, [secondOptimisticID]: 12003},
            });
            await ColdStartOnyx.set(`${coldStartOnyxKeys.COLLECTION.AGENT}${realAccountID}`, {prompt: 'Saved instructions'});
            await ColdStartOnyx.set(`${coldStartOnyxKeys.COLLECTION.REPORT}${reportID}`, {
                reportID,
                participants: {[hasOrphanReport ? optimisticAccountID : realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}},
            });
            await waitForBatchedUpdates();
            const mergeSpy = jest.spyOn(ColdStartOnyx, 'merge');
            const updateSpy = jest.spyOn(ColdStartOnyx, 'update');
            mockIsReady.mockReturnValue(true);
            mockGetRootState.mockClear();
            mockGetRootState.mockReturnValue(buildAgentEditNavigationState(optimisticAccountID));
            // When a fresh session loads the retained mappings, their action and navigation resolution must recover
            require<typeof ReplaceOptimisticAgentWithActualAgentModule>('@src/libs/actions/replaceOptimisticAgentWithActualAgent');
            await waitForBatchedUpdates();
            const readColdStartValue = require<typeof GetOnyxValueModule>('../utils/getOnyxValue').default;

            // Then completed cleanup causes no writes and keeps nothing for a retry, while a report-only orphan is still repaired
            expect(mockGetRootState).toHaveBeenCalledTimes(1);
            expect(mockSubscribeToPersonalDetails).not.toHaveBeenCalled();
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
            expect(updateSpy).not.toHaveBeenCalled();
            expect(mergeSpy).toHaveBeenCalledTimes(hasOrphanReport ? 1 : 0);
            expect((await readColdStartValue(`${coldStartOnyxKeys.COLLECTION.REPORT}${reportID}`))?.participants).toStrictEqual({
                [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            });
            expect((await readColdStartValue(coldStartOnyxKeys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBe(realAccountID);
            mergeSpy.mockRestore();
            updateSpy.mockRestore();
        });
    });
});
