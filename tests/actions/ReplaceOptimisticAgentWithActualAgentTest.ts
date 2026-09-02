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

    it('migrates the errors of the optimistic personal detail and agent prompt onto the real accountID and clears the optimistic keys', async () => {
        // Given the real personal detail and prompt sent by the server, and optimistic state carrying an ADD
        // pendingAction (from the CreateAgent that just succeeded) and errors from requests queued against the
        // optimistic agent
        const optimisticAccountID = 1029384756102938;
        const realAccountID = 8473625190847362;
        const errorTimestamp = '1725148800000000';
        const avatarErrors = {[errorTimestamp]: 'Unexpected error updating the avatar'};
        const promptErrors = {[errorTimestamp]: 'Unexpected error updating the prompt'};
        const realPersonalDetail = {accountID: realAccountID, displayName: 'Concierge Travel', login: 'agent+8473625190847362@expensify.com'};

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [realAccountID]: realPersonalDetail,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                displayName: 'Concierge Travel',
                isOptimisticPersonalDetail: true,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errorFields: {avatar: avatarErrors},
            },
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, {prompt: 'Book my flights'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            errors: promptErrors,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the real personal detail receives the errorFields but neither the ADD pendingAction nor the
        // optimistic identity fields (accountID / isOptimisticPersonalDetail)
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual({...realPersonalDetail, errorFields: {avatar: avatarErrors}});
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();

        // And the real agent prompt keeps the errors but not the ADD pendingAction
        const realPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(realPrompt).toStrictEqual({prompt: 'Book my flights', errors: promptErrors});
        const optimisticPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`);
        expect(optimisticPrompt).toBeUndefined();
    });

    it('keeps the real avatar and login when the optimistic personal detail holds a local avatar URI with no pending edit', async () => {
        // Given the real personal detail sent by the server and the optimistic one createAgent() wrote for an agent
        // created with an uploaded avatar, whose avatar is a local file URI
        const optimisticAccountID = 4657382910465738;
        const realAccountID = 8283746501928374;
        const realPersonalDetail = {
            accountID: realAccountID,
            displayName: 'Concierge Travel',
            login: 'agent+8283746501928374@expensify.com',
            avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/real.png',
            avatarThumbnail: 'https://d1wpcgnaa73g0y.cloudfront.net/real_128.png',
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [realAccountID]: realPersonalDetail,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                displayName: 'Concierge Travel',
                isOptimisticPersonalDetail: true,
                avatar: 'blob:https://new.expensify.com/4657382910465738',
                avatarThumbnail: 'blob:https://new.expensify.com/4657382910465738',
            },
        });
        await waitForBatchedUpdates();

        // When the mapping written by CreateAgent's success response is consumed
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
        await waitForBatchedUpdates();

        // Then the real personal detail is untouched, the optimistic one is removed and the mapping entry is cleared
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual(realPersonalDetail);
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
        const mapping = await getOnyxValue(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        expect(mapping?.[optimisticAccountID]).toBeUndefined();
    });

    it('carries a pending avatar edit and its pendingFields marker onto the real personal detail', async () => {
        // Given an UpdateAgentAvatar queued against the optimistic agent while CreateAgent was still in flight
        const optimisticAccountID = 5768493021576849;
        const realAccountID = 3049586172304958;
        const pendingAvatarURI = 'blob:https://new.expensify.com/5768493021576849';
        const realPersonalDetail = {
            accountID: realAccountID,
            displayName: 'Concierge Travel',
            login: 'agent+3049586172304958@expensify.com',
            avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/real.png',
            avatarThumbnail: 'https://d1wpcgnaa73g0y.cloudfront.net/real_128.png',
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [realAccountID]: realPersonalDetail,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                displayName: 'Concierge Travel',
                isOptimisticPersonalDetail: true,
                avatar: pendingAvatarURI,
                avatarThumbnail: pendingAvatarURI,
                pendingFields: {avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        // Then the real personal detail shows the pending avatar along with its pendingFields marker
        const personalDetails = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
        expect(personalDetails?.[realAccountID]).toStrictEqual({
            ...realPersonalDetail,
            avatar: pendingAvatarURI,
            avatarThumbnail: pendingAvatarURI,
            pendingFields: {avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });
        expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
    });

    it('keeps the real prompt when the optimistic prompt has no pending edit', async () => {
        // Given the real prompt sent by the server and an optimistic prompt whose only pendingAction is the ADD of
        // the CreateAgent that just succeeded
        const optimisticAccountID = 6879504132687950;
        const realAccountID = 2130495867213049;

        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, {prompt: 'Book my flights'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights (optimistic)',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const realPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(realPrompt).toStrictEqual({prompt: 'Book my flights'});
        const optimisticPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`);
        expect(optimisticPrompt).toBeUndefined();
    });

    it('carries a pending prompt edit and its UPDATE pendingAction onto the real prompt', async () => {
        // Given an UpdateAgentPrompt queued against the optimistic agent while CreateAgent was still in flight
        const optimisticAccountID = 7980615243798061;
        const realAccountID = 1243506978124350;

        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, {prompt: 'Book my flights'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {
            prompt: 'Book my flights and hotels',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        });
        await waitForBatchedUpdates();

        replaceOptimisticAgentWithActualAgent(optimisticAccountID, realAccountID);
        await waitForBatchedUpdates();

        const realPrompt = await getOnyxValue(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`);
        expect(realPrompt).toStrictEqual({prompt: 'Book my flights and hotels', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
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

    it('migrates nothing and only clears the entry when the mapping value is not a valid accountID', async () => {
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

        // Then the optimistic data is neither migrated nor deleted, and the unusable entries are gone from the mapping
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
});
