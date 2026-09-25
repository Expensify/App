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
                onPress={() =>
                    onParticipantsAdded([
                        {
                            reportID: 'selected-report-1',
                            accountID: 2,
                            selected: true,
                        },
                    ])
                }
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
    });

    it('auto-navigates to the default group workspace when eligible and configured for auto-reporting', async () => {
        const mockPolicy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
            id: 'policy-1',
            autoReporting: true,
        };
        const mockExpenseChat = {
            ...createRandomReport(10),
            reportID: 'report-expense-1',
        };

        jest.mocked(useDefaultExpensePolicy).mockReturnValue(mockPolicy);
        jest.mocked(shouldUseDefaultExpensePolicy).mockReturnValue(true);
        jest.mocked(getPolicyExpenseChat).mockReturnValue(mockExpenseChat);

        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        expect(clearMoneyRequest).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, expect.anything());
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('report-expense-1'), expect.objectContaining({afterTransition: expect.any(Function)}));
    });

    it('renders the participant picker when user is not eligible for auto-navigation', async () => {
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

    it('clears draft transaction on fresh manual participant selection and clears policy fields on subsequent re-selections', async () => {
        render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
        await waitForBatchedUpdatesWithAct();

        // Initial manual selection -> clears leftover draft
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        expect(clearMoneyRequest).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('selected-report-1'));

        jest.clearAllMocks();

        // Subsequent selection keeps general draft data but clears fields tied to the previous destination policy.
        fireEvent.press(screen.getByTestId('mock-select-participant'));
        await waitForBatchedUpdatesWithAct();

        expect(clearMoneyRequest).not.toHaveBeenCalled();
        expect(clearMoneyRequestPolicyFields).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        expect(clearUnknownUserDetails).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_SUBMIT_DETAILS.getRoute('selected-report-1'));
    });
});
