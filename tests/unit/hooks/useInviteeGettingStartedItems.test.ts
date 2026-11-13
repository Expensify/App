import {renderHook, waitFor} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useInviteeGettingStartedItems from '@pages/home/GettingStartedSection/hooks/useInviteeGettingStartedItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({startMoneyRequest: jest.fn()}));

// Passes through to the real hook so a single test can report the transactions collection as still loading.
jest.mock('@hooks/useOnyx', () => {
    const actual = jest.requireActual<{default: (...args: unknown[]) => unknown}>('@hooks/useOnyx');
    return {__esModule: true, default: jest.fn(actual.default)};
});

const {startMoneyRequest} = jest.requireMock<{startMoneyRequest: jest.Mock}>('@libs/actions/IOU/MoneyRequest');
const useOnyxMock = jest.requireMock<{default: jest.Mock}>('@hooks/useOnyx').default;
const actualUseOnyx = jest.requireActual<{default: (...args: unknown[]) => unknown}>('@hooks/useOnyx').default;

const POLICY_ID = '1';
const OTHER_POLICY_ID = '2';
const PERSONAL_POLICY_ID = '3';
const CURRENT_USER_ACCOUNT_ID = 5;

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Test Workspace'),
        id: POLICY_ID,
        pendingAction: undefined,
        role: CONST.POLICY.ROLE.USER,
        ...overrides,
    };
}

/** Builds a DB-style timestamp (UTC, no timezone suffix) the given number of days in the past, like `policy.created`. */
function daysAgoDBTime(days: number): string {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * A user who signed up through a workspace invite is a plain member of a workspace someone else owns. Their personal
 * policy is created at signup, a week ago unless overridden.
 */
async function setupWorkspaceInviteeScenario(overrides: {policy?: Partial<Policy>; accountCreated?: string | null} = {}) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({ownerAccountID: CURRENT_USER_ACCOUNT_ID + 1, ...overrides.policy}));
    await Onyx.merge(
        `${ONYXKEYS.COLLECTION.POLICY}${PERSONAL_POLICY_ID}`,
        buildPolicy({
            id: PERSONAL_POLICY_ID,
            type: CONST.POLICY.TYPE.PERSONAL,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            created: overrides.accountCreated === null ? undefined : (overrides.accountCreated ?? daysAgoDBTime(7)),
        }),
    );
    await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
    await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE});
    await waitForBatchedUpdates();
}

describe('useInviteeGettingStartedItems', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        useOnyxMock.mockImplementation(actualUseOnyx);
        startMoneyRequest.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('visibility rules', () => {
        it('should show the section for a member who joined through a workspace invite', async () => {
            // Given a brand new user who joined through an invite to someone else's workspace
            await setupWorkspaceInviteeScenario();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list applies and the section shows
            expect(result.current.isMemberWithoutAdminRole).toBe(true);
            expect(result.current.shouldShowSection).toBe(true);
        });

        it('should show the section even when the invited workspace was created long ago', async () => {
            // Given a new invitee whose workspace is older than the 60-day window, because the workspace age says nothing about when they joined
            await setupWorkspaceInviteeScenario({policy: {created: '2020-01-01 00:00:00'}});

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the section still shows
            expect(result.current.shouldShowSection).toBe(true);
        });

        it('should be hidden when the invitee created their account more than 60 days ago', async () => {
            // Given an invitee whose personal policy, created at signup, is past the 60-day window, so they are no longer new
            await setupWorkspaceInviteeScenario({accountCreated: daysAgoDBTime(61)});

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then no section shows
            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should be hidden when the account creation date is unknown', async () => {
            // Given an invitee whose personal policy has no creation date, so the window can't be checked
            await setupWorkspaceInviteeScenario({accountCreated: null});

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then no section shows instead of showing it forever
            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should keep the member list when the invitee joins a second workspace as a member', async () => {
            // Given a new invitee who later joined another group workspace, which doesn't make them any less new to Expensify
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, buildPolicy({id: OTHER_POLICY_ID}));
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list still applies
            expect(result.current.isMemberWithoutAdminRole).toBe(true);
        });

        it('should hand an invitee who is an admin of another workspace to the intent-based list', async () => {
            // Given an invitee who is a member of the invited workspace but an admin of another one
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, buildPolicy({id: OTHER_POLICY_ID, role: CONST.POLICY.ROLE.ADMIN}));
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list no longer applies
            expect(result.current.isMemberWithoutAdminRole).toBe(false);
        });

        it('should hand an invitee who is an admin of the workspace to the intent-based list', async () => {
            // Given an invitee who was made an admin
            await setupWorkspaceInviteeScenario({policy: {role: CONST.POLICY.ROLE.ADMIN}});

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list no longer applies
            expect(result.current.isMemberWithoutAdminRole).toBe(false);
        });

        it('should hand an invitee who owns the workspace without an admin role to the intent-based list', async () => {
            // Given an invitee who owns the workspace
            await setupWorkspaceInviteeScenario({policy: {ownerAccountID: CURRENT_USER_ACCOUNT_ID}});

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list no longer applies
            expect(result.current.isMemberWithoutAdminRole).toBe(false);
        });

        it('should ignore the personal workspace the invitee owns', async () => {
            // Given an invitee who owns a personal policy, which every account has, so ownership there doesn't make them an admin
            await setupWorkspaceInviteeScenario();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list still applies
            expect(result.current.isMemberWithoutAdminRole).toBe(true);
        });

        it('should ignore an admin role on a workspace that is pending deletion', async () => {
            // Given an invitee whose admin workspace is being deleted, so it no longer decides which list applies
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`,
                buildPolicy({id: OTHER_POLICY_ID, role: CONST.POLICY.ROLE.ADMIN, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            );
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the member list still applies
            expect(result.current.isMemberWithoutAdminRole).toBe(true);
        });

        it('should wait for transactions to load before showing the section', async () => {
            // Given an invitee who added a name and signed in on a mobile app, while their transactions are still loading
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, firstName: 'Jane'}});
            await Onyx.merge(ONYXKEYS.NVP_LAST_ANDROID_LOGIN, '2026-11-01 10:00:00');
            await waitForBatchedUpdates();
            useOnyxMock.mockImplementation((key: unknown, ...rest: unknown[]) => (key === ONYXKEYS.COLLECTION.TRANSACTION ? [undefined, {status: 'loading'}] : actualUseOnyx(key, ...rest)));

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the section stays hidden, so a user who already has an expense doesn't see it flash in and disappear
            expect(result.current.shouldShowSection).toBe(false);
        });
    });

    describe('items and check states', () => {
        it('should mark every step incomplete for a new invitee', async () => {
            // Given an invitee with no name, no expenses and no mobile app sign-in
            await setupWorkspaceInviteeScenario();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then nothing is checked off
            expect(result.current.addNameItem.isComplete).toBe(false);
            expect(result.current.addFirstReceiptItem.isComplete).toBe(false);
            expect(result.current.downloadAppItem.isComplete).toBe(false);
        });

        it('should complete "Add your name" once the user has a first name', async () => {
            // Given an invitee who saved a first name
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, firstName: 'Jane', displayName: 'Jane'}});
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the name step is complete
            expect(result.current.addNameItem.isComplete).toBe(true);
        });

        it('should not complete "Add your name" from the default display name alone', async () => {
            // Given an invitee whose display name is only the email fallback
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, firstName: '', displayName: 'jane@test.com'}});
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the name step stays incomplete
            expect(result.current.addNameItem.isComplete).toBe(false);
        });

        it('should complete "Add your first receipt" once any expense exists', async () => {
            // Given an invitee who created an expense anywhere in the product
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', amount: 100});
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the receipt step is complete
            expect(result.current.addFirstReceiptItem.isComplete).toBe(true);
        });

        it('should complete "Download the app" once the user signed in on a mobile app', async () => {
            // Given an invitee with a recorded iOS app sign-in
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN, '2026-11-01 10:00:00');
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the download step is complete
            expect(result.current.downloadAppItem.isComplete).toBe(true);
        });

        it('should check off a step as soon as the user completes it', async () => {
            // Given a new invitee looking at the checklist
            await setupWorkspaceInviteeScenario();
            const {result} = renderHook(() => useInviteeGettingStartedItems());
            expect(result.current.addNameItem.isComplete).toBe(false);

            // When they save a name while the section is on screen
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, firstName: 'Jane'}});

            // Then the step flips to complete without a reload
            await waitFor(() => expect(result.current.addNameItem.isComplete).toBe(true));
        });

        it('should hide the section once all three steps are complete', async () => {
            // Given an invitee who finished every step
            await setupWorkspaceInviteeScenario();
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, lastName: 'Doe'}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', amount: 100});
            await Onyx.merge(ONYXKEYS.NVP_LAST_ANDROID_LOGIN, '2026-11-01 10:00:00');
            await waitForBatchedUpdates();

            // When the hook builds the checklist
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // Then the section hides, like every other intent does
            expect(result.current.shouldShowSection).toBe(false);
        });

        it('should open the display name page, the Scan tab of the create expense flow and the app download links', async () => {
            // Given a new invitee
            await setupWorkspaceInviteeScenario();
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            const {result} = renderHook(() => useInviteeGettingStartedItems());

            // When each step is pressed
            result.current.addFirstReceiptItem.onPress?.();
            result.current.downloadAppItem.onPress?.();

            // Then each one leads to its own screen
            expect(result.current.addNameItem.route).toBe(ROUTES.SETTINGS_DISPLAY_NAME);
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, expect.any(String), expect.anything(), CONST.IOU.REQUEST_TYPE.SCAN);
            expect(navigateSpy).toHaveBeenCalledWith(expect.stringContaining('app-download-links'));
            navigateSpy.mockRestore();
        });
    });
});
