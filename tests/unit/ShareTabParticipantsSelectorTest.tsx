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
        default: ({onParticipantsAdded, initiallySelectedReportID}: {onParticipantsAdded: (participants: Participant[]) => void; initiallySelectedReportID?: string}) => (
            <MockPressable
                testID="mock-select-participant"
                onPress={() => onParticipantsAdded([mockSelectedParticipant])}
            >
                <MockText>{`Selected: ${initiallySelectedReportID ?? 'none'}`}</MockText>
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
        jest.mocked(usePreferredPolicy).mockReturnValue({
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
            isRestrictedPolicyCreation: false,
        });
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
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('report-expense-1'), expect.objectContaining({afterTransition: expect.any(Function)}));
    });

    it('renders the participant picker when user is not eligible for auto-navigation', async () => {
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not keep the Submit tab blank when the current user login is unavailable', async () => {
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 1,
            login: '',
            displayName: 'Tester',
        });

        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not blank out the picker when policy data arrives after committing to the picker', async () => {
        const {rerender} = render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('mock-select-participant')).toBeTruthy();

        // Simulate late-arriving Onyx data making autoNavigateReportID truthy after commit
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

        // Picker must remain visible (not null/blank) and not auto-navigate away
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
});
