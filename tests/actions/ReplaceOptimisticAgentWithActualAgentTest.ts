import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';

import type * as NavigationModule from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {replaceOptimisticAgentWithActualAgent, resolveAgentAccountID} from '@src/libs/actions/replaceOptimisticAgentWithActualAgent';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type Navigation = typeof NavigationModule.default;

const mockSetParams = jest.fn<ReturnType<Navigation['setParams']>, Parameters<Navigation['setParams']>>();
const mockIsReady = jest.fn(() => false);
const mockGetRootState = jest.fn<PartialState<NavigationState> | undefined, []>(() => undefined);

jest.mock('@libs/Navigation/Navigation', () => {
    const mockNavigation = {
        setParams: (...args: Parameters<Navigation['setParams']>): ReturnType<Navigation['setParams']> => mockSetParams(...args),
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

    it('migrates the optimistic personal detail and agent prompt onto the real accountID and clears the optimistic keys', async () => {
        // Given optimistic state carrying an ADD pendingAction (from the CreateAgent that just succeeded) and errors
        // from a request queued against the optimistic agent
        const optimisticAccountID = 1029384756102938;
        const realAccountID = 8473625190847362;
        const errorTimestamp = '1725148800000000';
        const errors = {[errorTimestamp]: 'Unexpected error updating the prompt'};

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                displayName: 'Concierge Travel',
                isOptimisticPersonalDetail: true,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            errors,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the real personal detail receives the migrated fields but neither the ADD pendingAction nor the
        // optimistic identity fields (accountID / isOptimisticPersonalDetail)
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual({displayName: 'Concierge Travel'});
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();

        // And the real agent prompt keeps the errors but not the ADD pendingAction
        const realPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(realPrompt).toStrictEqual({prompt: 'Book my flights', errors});
        const optimisticPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`);
        expect(optimisticPrompt).toBeUndefined();
    });

    it('preserves a DELETE pendingAction on the agent prompt when migrating it to the real key', async () => {
        // Given a DeleteAgent queued against the optimistic agent while CreateAgent was still in flight
        const optimisticAccountID = 3948576102394857;
        const realAccountID = 6158293047615829;

        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const realPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(realPrompt).toStrictEqual({prompt: 'Book my flights', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
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
});
