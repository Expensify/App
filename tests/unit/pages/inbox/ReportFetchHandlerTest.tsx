import type * as NativeNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockOpenReport = jest.fn();

jest.mock('@userActions/Report', () => ({
    openReport: mockOpenReport,
    readNewestAction: jest.fn(),
    subscribeToReportLeavingEvents: jest.fn(),
    unsubscribeFromLeavingRoomReportChannel: jest.fn(),
    createTransactionThreadReport: jest.fn(),
    updateLastVisitTime: jest.fn(),
}));

jest.mock('@userActions/Composer', () => ({
    setShouldShowComposeInput: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({
            params: {reportID: '123'},
            name: 'Report',
        }),
        useNavigation: () => ({
            navigate: jest.fn(),
            setParams: jest.fn(),
            addListener: jest.fn(),
        }),
        useIsFocused: () => true,
    };
});

jest.mock('@hooks/useIsInSidePanel', () => jest.fn(() => false));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, email: 'test@test.com'})));
jest.mock('@hooks/useIsAnonymousUser', () => jest.fn(() => false));
jest.mock('@hooks/useIsOwnWorkspaceChatRef', () => jest.fn(() => ({current: false})));
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn(() => ({reportActions: [], linkedAction: undefined})));
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn(() => ({})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@libs/getNonEmptyStringOnyxID', () => jest.fn((id: string) => id));
jest.mock('@libs/MoneyRequestReportUtils', () => ({getAllNonDeletedTransactions: jest.fn(() => [])}));
jest.mock('@libs/ReportActionsUtils', () => ({
    getFilteredReportActionsForReportView: jest.fn(() => []),
    getIOUActionForReportID: jest.fn(),
    getOneTransactionThreadReportID: jest.fn(),
    isCreatedAction: jest.fn(() => false),
}));
jest.mock('@libs/ReportUtils', () => ({
    isChatThread: jest.fn(() => false),
    isHiddenForCurrentUser: jest.fn(() => false),
    isOneTransactionThread: jest.fn(() => false),
    isPolicyExpenseChat: jest.fn(() => false),
    isReportTransactionThread: jest.fn(() => false),
    isTaskReport: jest.fn(() => false),
    isValidReportIDFromPath: jest.fn(() => true),
}));
jest.mock('@src/components/ConfirmedRoute.tsx', () => jest.fn());

const ReportFetchHandler = (require('@pages/inbox/ReportFetchHandler') as {default: React.ComponentType}).default;

/**
 * Helper to render the component, wait for initial effects, record baseline call count,
 * then transition isLoadingApp from true to false and return the delta in openReport calls.
 */
async function measureOpenReportCallsDuringTransition(): Promise<{delta: number; unmount: () => void}> {
    const {unmount} = render(<ReportFetchHandler />);
    await act(async () => {
        await waitForBatchedUpdates();
    });

    const baseline = mockOpenReport.mock.calls.length;

    await act(async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();
    });

    return {delta: mockOpenReport.mock.calls.length - baseline, unmount};
}

/**
 * Helper that mounts with isLoadingApp already false (simulates iOS where the component
 * mounts after openApp has finished). Returns delta from mount.
 */
async function measureOpenReportCallsOnMountWithLoadingFalse(): Promise<{delta: number; unmount: () => void}> {
    await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
    await waitForBatchedUpdates();

    const baseline = mockOpenReport.mock.calls.length;

    const {unmount} = render(<ReportFetchHandler />);
    await act(async () => {
        await waitForBatchedUpdates();
    });

    return {delta: mockOpenReport.mock.calls.length - baseline, unmount};
}

describe('ReportFetchHandler - invite onboarding fetch effect', () => {
    // When isLoadingApp transitions from true to false, a baseline number of openReport calls occur
    // from other effects (e.g., isLoadingReportData transition). The invite onboarding effect
    // adds exactly one additional call when conditions are met.
    let baselineDelta: number;

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});

        // Measure baseline: no introSelected, so the new effect should NOT fire
        await Onyx.clear();
        await waitForBatchedUpdates();
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        baselineDelta = delta;
        unmount();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should re-trigger openReport when isLoadingApp transitions from true to false for ADMIN choice', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.ADMIN,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta + 1);
        unmount();
    });

    it('should re-trigger openReport for SUBMIT choice', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.SUBMIT,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta + 1);
        unmount();
    });

    it('should re-trigger openReport for CHAT_SPLIT choice', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta + 1);
        unmount();
    });

    it('should trigger openReport when isLoadingApp is already false at mount (iOS scenario)', async () => {
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.ADMIN,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsOnMountWithLoadingFalse();
        // Should still trigger the invite onboarding fetch even without a true→false transition
        expect(delta).toBeGreaterThan(0);
        unmount();
    });

    it('should NOT re-trigger openReport for IOU invite type', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.ADMIN,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });

    it('should NOT re-trigger openReport for INVOICE invite type', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.SUBMIT,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });

    it('should NOT re-trigger openReport when onboarding is already completed', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.ADMIN,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });

    it('should NOT re-trigger openReport when invite onboarding is already complete', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.ADMIN,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
            isInviteOnboardingComplete: true,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });

    it('should NOT re-trigger openReport when introSelected is not set', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });

    it('should NOT re-trigger openReport for non-invite choices like PERSONAL_SPEND', async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {
            choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
            inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await waitForBatchedUpdates();

        const {delta, unmount} = await measureOpenReportCallsDuringTransition();
        expect(delta).toBe(baselineDelta);
        unmount();
    });
});
