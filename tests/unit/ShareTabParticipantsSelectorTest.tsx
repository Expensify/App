/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {fireEvent, render, screen} from '@testing-library/react-native';

import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useUserSecurityGroup from '@hooks/useUserSecurityGroup';

import {clearMoneyRequest, clearMoneyRequestPolicyFields} from '@libs/actions/IOU/MoneyRequest';
import {clearUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type GetPolicyExpenseChatFn = typeof getPolicyExpenseChat;
type ReportUtilsActual = Record<string, unknown> & {getPolicyExpenseChat: GetPolicyExpenseChatFn};
let mockSelectedParticipant: Participant = {};

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useDefaultExpensePolicy');
jest.mock('@hooks/usePreferredPolicy');
jest.mock('@hooks/useUserSecurityGroup');
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    clearMoneyRequest: jest.fn(),
    clearMoneyRequestPolicyFields: jest.fn(),
}));
jest.mock('@libs/actions/Share', () => ({
    clearUnknownUserDetails: jest.fn(),
    saveUnknownUserDetails: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));
jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<ReportUtilsActual>('@libs/ReportUtils');
    return {
        ...actual,
        getPolicyExpenseChat: jest.fn(),
    };
});
jest.mock('@libs/shouldUseDefaultExpensePolicy', () => jest.fn());
jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: jest.fn(),
    getSpan: jest.fn(),
    startSpan: jest.fn(),
}));
jest.mock('@pages/iou/request/MoneyRequestParticipantsSelector', () => {
    const {Pressable: MockPressable, Text: MockText} = jest.requireActual('react-native');
    return {
        __esModule: true,
        default: ({
            onParticipantsAdded,
            initiallySelectedReportID,
            shouldExcludeP2P,
        }: {
            onParticipantsAdded: (participants: Participant[]) => void;
            initiallySelectedReportID?: string;
            shouldExcludeP2P?: boolean;
        }) => (
            <MockPressable
                testID="mock-select-participant"
                onPress={() => onParticipantsAdded([mockSelectedParticipant])}
            >
                <MockText>{`Selected: ${initiallySelectedReportID ?? 'none'}`}</MockText>
                <MockText testID="mock-excludes-p2p">{String(shouldExcludeP2P)}</MockText>
            </MockPressable>
        ),
    };
});

describe('ShareTabParticipantsSelector', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await waitForBatchedUpdatesWithAct();

        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 1,
            login: 'test@example.com',
            displayName: 'Tester',
        });
        const preferredPolicy = {
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
            isRestrictedPolicyCreation: false,
            isLoadingPreferredPolicy: false,
        };
        jest.mocked(usePreferredPolicy).mockReturnValue(preferredPolicy);
        jest.mocked(useUserSecurityGroup).mockReturnValue({
            securityGroup: undefined,
            isLoadingSecurityGroup: false,
        });
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(undefined);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(false);
        jest.mocked(getPolicyExpenseChat).mockReturnValue(undefined);
        mockSelectedParticipant = {
            reportID: 'selected-report-1',
            accountID: 2,
            policyID: 'policy-1',
            selected: true,
        };
    });

    it('auto-navigates to the eligible default group workspace when auto-reporting is disabled', async () => {
        // Given an eligible default group workspace with auto-reporting disabled
        const mockPolicy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
            id: 'policy-1',
            autoReporting: false,
        };
        const mockExpenseChat = {
            ...createRandomReport(10),
            reportID: 'report-expense-1',
        };

        jest.mocked(useDefaultExpensePolicy).mockReturnValue(mockPolicy);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(true);
        jest.mocked(getPolicyExpenseChat).mockReturnValue(mockExpenseChat);

        // When the Share Submit destination resolves
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the workspace expense chat opens directly regardless of its auto-reporting setting
        expect(clearMoneyRequest).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, expect.anything());
        expect(clearUnknownUserDetails).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('report-expense-1'), expect.objectContaining({afterTransition: expect.any(Function)}));
    });

    it('renders the participant picker when user is not eligible for auto-navigation', async () => {
        // Given the user has no eligible default workspace destination

        // When the Share Submit destination selector renders
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the participant picker remains visible without navigating automatically
        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('excludes personal recipients when the preserved Share draft has a negative amount', async () => {
        // Given the user flipped the amount negative before returning to the destination picker
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {amount: -1000});

        // When the Share Submit destination selector renders
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the existing participant picker is instructed to exclude unsupported P2P destinations
        expect(screen.getByTestId('mock-excludes-p2p')).toHaveTextContent('true');
    });

    it('does not keep the Submit tab blank when the current user login is unavailable', async () => {
        // Given the current user's personal details have not hydrated their login
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 1,
            login: '',
            displayName: 'Tester',
        });

        // When the Share Submit destination selector renders
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the participant picker remains available instead of rendering a blank tab
        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not blank out the picker when policy data arrives after committing to the picker', async () => {
        // Given the selector initially resolves to the participant picker
        const {rerender} = render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();

        // When late Onyx data provides an eligible automatic destination after that decision
        const mockPolicy = {
            ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
            id: 'policy-late',
            autoReporting: true,
        };
        const mockExpenseChat = {
            ...createRandomReport(20),
            reportID: 'report-late-1',
        };

        jest.mocked(useDefaultExpensePolicy).mockReturnValue(mockPolicy);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(true);
        jest.mocked(getPolicyExpenseChat).mockReturnValue(mockExpenseChat);

        rerender(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the committed picker remains visible and does not navigate unexpectedly
        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('waits for an eligible default workspace expense chat to hydrate before navigating', async () => {
        // Given an eligible default workspace whose expense chat has not hydrated yet
        const mockPolicy = {
            ...createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE),
            id: 'policy-hydrating',
        };
        const mockExpenseChat = {
            ...createRandomReport(30),
            reportID: 'report-hydrated-1',
        };

        jest.mocked(useDefaultExpensePolicy).mockReturnValue(mockPolicy);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(true);
        jest.mocked(getPolicyExpenseChat).mockImplementation((_ownerAccountID, _policyID, reports) =>
            reports?.[`${ONYXKEYS.COLLECTION.REPORT}${mockExpenseChat.reportID}`] ? mockExpenseChat : undefined,
        );

        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the picker is not committed while the known destination is still hydrating
        expect(screen.queryByTestId('mock-select-participant')).toBeNull();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the matching expense chat arrives from Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockExpenseChat.reportID}`, mockExpenseChat);
        await waitForBatchedUpdatesWithAct();

        // Then the flow navigates directly to confirmation instead of remaining on the picker
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('report-hydrated-1'), expect.objectContaining({afterTransition: expect.any(Function)}));
    });

    it('falls back to the picker when hydrated reports do not contain the eligible workspace expense chat', async () => {
        // Given an eligible default workspace whose expense chat is absent from the hydrated report collection
        const mockPolicy = {
            ...createRandomPolicy(4, CONST.POLICY.TYPE.CORPORATE),
            id: 'policy-without-expense-chat',
        };
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(mockPolicy);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(true);
        jest.mocked(getPolicyExpenseChat).mockReturnValue(undefined);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}unrelated-report`, createRandomReport(40));

        // When destination resolution completes
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the participant picker remains usable instead of waiting indefinitely
        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('clears the draft on the initial selection but preserves every field when selecting the same destination again', async () => {
        // Given the participant picker has no previously selected destination
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // When the user makes the initial selection
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        // Then stale draft data is cleared before opening confirmation
        expect(clearMoneyRequest).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('selected-report-1'));

        jest.clearAllMocks();

        // When the user selects that exact destination again
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        // Then no draft or policy fields are cleared
        expect(clearMoneyRequest).not.toHaveBeenCalled();
        expect(clearMoneyRequestPolicyFields).not.toHaveBeenCalled();
        expect(clearUnknownUserDetails).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('selected-report-1'));
    });

    it('clears policy fields only when the selected destination belongs to another policy', async () => {
        // Given the user initially selected a destination in policy 1
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();
        jest.clearAllMocks();

        // When they select a different report in the same policy
        mockSelectedParticipant = {...mockSelectedParticipant, reportID: 'selected-report-2'};
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        // Then policy-owned fields remain valid and are preserved
        expect(clearMoneyRequestPolicyFields).not.toHaveBeenCalled();

        // When they select a report belonging to another policy
        mockSelectedParticipant = {...mockSelectedParticipant, reportID: 'selected-report-3', policyID: 'policy-2'};
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        // Then fields owned by the previous policy are cleared
        expect(clearMoneyRequestPolicyFields).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
    });

    it('does not treat different fake-policy destinations as the same policy', async () => {
        // Given the user initially selected a non-workspace destination with the fake policy sentinel
        mockSelectedParticipant = {...mockSelectedParticipant, reportID: 'self-dm-report', policyID: CONST.POLICY.ID_FAKE};
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();
        jest.clearAllMocks();

        // When they select a different non-workspace destination with the same fake policy sentinel
        mockSelectedParticipant = {...mockSelectedParticipant, reportID: 'p2p-report'};
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        // Then stale policy-owned fields are cleared because the sentinel does not represent a real shared policy
        expect(clearMoneyRequestPolicyFields).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
    });
});
