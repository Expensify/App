import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';

import {resolveAgentAccountID} from '@libs/AgentAccountIDMapping';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type * as NavigationModule from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type * as ReplaceOptimisticAgentWithActualAgentModule from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import {replaceOptimisticAgentWithActualAgent} from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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

    it('clears the optimistic personal detail and prompt without carrying their stale state onto the real agent', async () => {
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

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [realAccountID]: realPersonalDetail,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                displayName: 'Concierge Travel',
                isOptimisticPersonalDetail: true,
                avatar: 'blob:https://new.expensify.com/1029384756102938',
                avatarThumbnail: 'blob:https://new.expensify.com/1029384756102938',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                pendingFields: {avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                errorFields: {avatar: {[errorTimestamp]: 'Unexpected error updating the avatar'}},
            },
        });
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

        // Then the real agent keeps exactly the server's data, the optimistic copies are gone and the mapping remains available to other tabs
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(realPersonalDetail);
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toStrictEqual(realAgentPrompt);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`)).toBeUndefined();
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBe(realAccountID);
    });

    it('does not resurrect an agent that was deleted while its CreateAgent was in flight', async () => {
        // Given a DeleteAgent queued against the optimistic agent that the middleware rewrote to the real accountID and
        // that already succeeded, so the real keys are gone while the optimistic prompt still shows the DELETE marker
        const optimisticAccountID = 3948576102394857;
        const realAccountID = 6158293047615829;

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true},
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {
            prompt: 'Book my flights',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then nothing is written under the real accountID and the optimistic keys are cleared
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toBeUndefined();
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`)).toBeUndefined();
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

        // Then the screen is redirected and only the optimistic data is cleared
        expect(mockSetParams).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeUndefined();
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

    it('keeps the mapping available to a tab that reads storage after the optimistic data has been removed', async () => {
        const optimisticAccountID = 2837465910283746;
        const realAccountID = 6058172439605817;

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Pending agent', isOptimisticPersonalDetail: true},
            [realAccountID]: {accountID: realAccountID, displayName: 'Created agent'},
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Test instructions'});
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Cross-tab Onyx notifications carry keys, then read their latest stored values. A receiving tab can
        // therefore read only after the first tab has completed cleanup, without seeing the intermediate mapping.
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeUndefined();
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

    // The module consumes a persisted mapping as soon as it loads, so the cold start is reproduced by seeding storage
    // (which outlives jest.resetModules()) and then loading the module against a fresh Onyx instance, the way
    // CloudflareSessionTest does. It stays last: the fresh instance never sees writes made through the imported one.
    describe('on app start', () => {
        it('consumes a persisted mapping once navigation is ready and the report collection has hydrated', async () => {
            // Given a session that was killed right after CreateAgent's response landed: the mapping is persisted along
            // with the optimistic agent and a DM still keyed by it, and the restored navigation state shows its EDIT screen
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
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true},
            });
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
            // and the optimistic data is cleared while the mapping remains available to other tabs
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)}, 'agents-edit-route-key', 'agent-settings-stack-key');
            const report = await getColdStartOnyxValue(`${coldStartOnyxKeys.COLLECTION.REPORT}${reportID}`);
            expect(report?.participants).toStrictEqual({
                [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            });
            expect((await getColdStartOnyxValue(coldStartOnyxKeys.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeUndefined();
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
                [coldStartOnyxKeys.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Created agent'}},
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

            // Then completed cleanup causes no writes, while a report-only orphan is still repaired
            expect(mockGetRootState).toHaveBeenCalledTimes(1);
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
