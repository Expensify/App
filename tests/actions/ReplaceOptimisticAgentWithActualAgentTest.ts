import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';

import {resolveAgentAccountID} from '@libs/AgentAccountIDMapping';
import type * as NavigationModule from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type * as ReplaceOptimisticAgentWithActualAgentModule from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import {replaceOptimisticAgentWithActualAgent} from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
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
                    routes: [{key: 'agents-edit-route-key', name: SCREENS.SETTINGS.AGENTS.EDIT, params: {accountID: String(accountID)}}],
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {prompt: 'Book my flights'});
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const reportAfterFirstRun = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        const personalDetailsAfterFirstRun = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        const promptAfterFirstRun = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toStrictEqual(reportAfterFirstRun);
        expect(await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST)).toStrictEqual(personalDetailsAfterFirstRun);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`)).toStrictEqual(promptAfterFirstRun);
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, realAgentPrompt);
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights and hotels',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errors: {[errorTimestamp]: 'Unexpected error updating the prompt'},
        });
        await waitForBatchedUpdates();

        // When the mapping written by CreateAgent's success response is consumed
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then the real agent keeps exactly the server's data, the optimistic copies are gone and the entry is cleared
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(realPersonalDetail);
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`)).toStrictEqual(realAgentPrompt);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`)).toBeUndefined();
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBeUndefined();
    });

    it('does not resurrect an agent that was deleted while its CreateAgent was in flight', async () => {
        // Given a DeleteAgent queued against the optimistic agent that the middleware rewrote to the real accountID and
        // that already succeeded, so the real keys are gone while the optimistic prompt still shows the DELETE marker
        const optimisticAccountID = 3948576102394857;
        const realAccountID = 6158293047615829;

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Concierge Travel', isOptimisticPersonalDetail: true},
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
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
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`)).toBeUndefined();
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
                            {key: 'agents-edit-route-key', name: SCREENS.SETTINGS.AGENTS.EDIT, params: {accountID: String(optimisticAccountID)}},
                            {key: 'agents-edit-name-route-key', name: SCREENS.SETTINGS.AGENTS.EDIT_NAME, params: {accountID: String(optimisticAccountID)}},
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
        expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID}, 'agents-edit-name-route-key', 'agent-settings-stack-key');
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, optimisticAgentPrompt);
        await waitForBatchedUpdates();

        // When the mapping is consumed before navigation is ready
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then late callers already resolve to the real accountID, but neither the redirect nor the cleanup has run, so
        // the open screen is not stranded on a deleted key
        expect(resolveAgentAccountID(optimisticAccountID)).toBe(realAccountID);
        expect(mockSetParams).not.toHaveBeenCalled();
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toStrictEqual(optimisticPersonalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`)).toStrictEqual(optimisticAgentPrompt);
        expect((await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBe(realAccountID);

        // When navigation becomes ready
        mockIsReady.mockReturnValue(true);
        navigationReady.resolve();
        await waitForBatchedUpdates();

        // Then the screen is redirected and only then is the optimistic data and the mapping entry cleared
        expect(mockSetParams).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID}, 'agents-edit-route-key', 'agent-settings-stack-key');
        expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`)).toBeUndefined();
        expect((await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBeUndefined();
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

    it('clears the mapping entry once it has been processed', async () => {
        const optimisticAccountID = 2837465910283746;
        const realAccountID = 6058172439605817;

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBeUndefined();
    });

    it('leaves the real agent untouched and only clears the entry when the mapping maps an accountID to itself', async () => {
        // Given a real agent whose personal detail and prompt would be deleted if the identity mapping were consumed
        const accountID = 8102837465910283;
        const personalDetail = {accountID, displayName: 'Concierge Travel', login: 'agent+8102837465910283@expensify.com'};
        const agentPrompt = {prompt: 'Book my flights'};

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: personalDetail});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, agentPrompt);
        await waitForBatchedUpdates();

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[accountID]: accountID});
        await waitForBatchedUpdates();

        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[accountID]).toStrictEqual(personalDetail);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`)).toStrictEqual(agentPrompt);
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${zeroMappedAccountID}`, agentPrompt);
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${negativeMappedAccountID}`, agentPrompt);
        await waitForBatchedUpdates();

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[zeroMappedAccountID]: 0, [negativeMappedAccountID]: -1});
        await waitForBatchedUpdates();

        // Then the optimistic data is kept and the unusable entries are gone from the mapping
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails).toStrictEqual({
            [zeroMappedAccountID]: zeroMappedPersonalDetail,
            [negativeMappedAccountID]: negativeMappedPersonalDetail,
        });
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${zeroMappedAccountID}`)).toStrictEqual(agentPrompt);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${negativeMappedAccountID}`)).toStrictEqual(agentPrompt);
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
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
            // and the optimistic data and the mapping entry are cleared
            expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID}, 'agents-edit-route-key', 'agent-settings-stack-key');
            const report = await getColdStartOnyxValue(`${coldStartOnyxKeys.COLLECTION.REPORT}${reportID}`);
            expect(report?.participants).toStrictEqual({
                [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [realAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            });
            expect((await getColdStartOnyxValue(coldStartOnyxKeys.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeUndefined();
            expect(await getColdStartOnyxValue(`${coldStartOnyxKeys.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`)).toBeUndefined();
            expect((await getColdStartOnyxValue(coldStartOnyxKeys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING))?.[optimisticAccountID]).toBeUndefined();
        });
    });
});
