import {act, render} from '@testing-library/react-native';

import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type * as SearchContext from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';

import useStrictPolicyRules from '@hooks/useStrictPolicyRules';

import Navigation from '@libs/Navigation/Navigation';

import {APPROVER_TYPE} from '@pages/DynamicReportChangeApproverPage';
import SearchChangeApproverPage from '@pages/Search/SearchChangeApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 123;
const SELECTED_REPORTS = [
    {reportID: 'reportA', policyID: 'policyA'},
    {reportID: 'reportB', policyID: 'policyB'},
];

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({shouldShow, children}: {shouldShow: boolean; children: React.ReactNode}) => (shouldShow ? null : children)));
jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContext>('@components/Search/SearchContext'),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
    useSearchSelectionContext: () => ({selectedReports: SELECTED_REPORTS}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: CURRENT_USER_ACCOUNT_ID, email: 'approver@test.com'}));
jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: ''}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (value: string) => value}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useStrictPolicyRules', () => jest.fn(() => ({areStrictPolicyRulesEnabled: false, isLoadingSecurityGroup: false})));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    closeRHPFlow: jest.fn(),
    setNavigationActionToMicrotaskQueue: (callback: () => void) => callback(),
}));
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    isAllowedToApproveExpenseReport: () => true,
}));

async function loadReports(roles: Array<Policy['role']>, managerID = CURRENT_USER_ACCOUNT_ID) {
    for (const [index, {reportID, policyID}] of SELECTED_REPORTS.entries()) {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, createMock<Policy>({id: policyID, role: roles[index], approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}));
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            createMock<Report>({
                reportID,
                policyID,
                managerID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            }),
        );
    }
    await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, false);
    await waitForBatchedUpdates();
}

describe('SearchChangeApproverPage permissions', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: false, isLoadingSecurityGroup: false});
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([
        {roles: [CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.USER], strictRules: false, managerID: CURRENT_USER_ACCOUNT_ID, options: [APPROVER_TYPE.REASSIGN_APPROVER]},
        {roles: [CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.USER], strictRules: false, managerID: CURRENT_USER_ACCOUNT_ID, options: [APPROVER_TYPE.REASSIGN_APPROVER]},
        {
            roles: [CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.ADMIN],
            strictRules: true,
            managerID: CURRENT_USER_ACCOUNT_ID,
            options: [APPROVER_TYPE.ADD_APPROVER, APPROVER_TYPE.BYPASS_APPROVER, APPROVER_TYPE.REASSIGN_APPROVER],
        },
        {roles: [CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.USER], strictRules: true, managerID: CURRENT_USER_ACCOUNT_ID, options: []},
        {roles: [CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.USER], strictRules: false, managerID: 456, options: []},
    ])('offers $options for roles=$roles, strict rules=$strictRules, manager=$managerID', async ({roles, strictRules, managerID, options}) => {
        // Given loaded reports with the user's workspace roles and domain restrictions
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: strictRules, isLoadingSecurityGroup: false});
        await loadReports(roles, managerID);

        // When the user opens the bulk change approver menu
        render(<SearchChangeApproverPage />);

        // Then only actions permitted across every selected report are available
        const props = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(props?.data?.map((option) => option.keyForList)).toEqual(options);
        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(options.length === 0 ? 1 : 0);
        expect(Navigation.navigate).toHaveBeenCalledTimes(options.length === 1 ? 1 : 0);
        if (options.length === 1) {
            expect(props?.data?.at(0)?.isSelected).toBe(true);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.CHANGE_APPROVER_REASSIGN_APPROVER_SEARCH_RHP);
        }
    });

    it.each([true, false])('waits for security-group loading before applying strict rules=%s', async (strictRules) => {
        // Given loaded reports whose member permissions are still unknown
        await loadReports([CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.USER]);
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: false, isLoadingSecurityGroup: true});
        const {rerender} = render(<SearchChangeApproverPage />);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();

        // When the actual domain restriction arrives
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: strictRules, isLoadingSecurityGroup: false});
        rerender(<SearchChangeApproverPage />);

        // Then only confirmed unrestricted members can enter reassignment
        expect(Navigation.navigate).toHaveBeenCalledTimes(strictRules ? 0 : 1);
        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(strictRules ? 1 : 0);
    });

    it.each(['report', 'policy'] as const)('shows unavailable when a completed fetch omits a selected %s', async (missingEntry) => {
        // Given a pending bulk fetch with one selected record missing
        await loadReports([CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.ADMIN]);
        await Onyx.set(missingEntry === 'report' ? `${ONYXKEYS.COLLECTION.REPORT}reportB` : `${ONYXKEYS.COLLECTION.POLICY}policyB`, null);
        await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, true);
        await waitForBatchedUpdates();
        render(<SearchChangeApproverPage />);
        expect(FullScreenLoadingIndicator).toHaveBeenCalled();
        jest.mocked(FullScreenLoadingIndicator).mockClear();

        // When the fetch finishes without supplying that record
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, false);
            await waitForBatchedUpdates();
        });

        // Then the user sees an unavailable view instead of an endless spinner or an incomplete picker
        expect(FullScreenLoadingIndicator).not.toHaveBeenCalled();
        expect(FullPageNotFoundView).toHaveBeenLastCalledWith(expect.objectContaining({shouldShow: true}), undefined);
        expect(SelectionList).not.toHaveBeenCalled();
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps the spinner while reports load after an earlier visit left the loading flag off', async () => {
        // Given an earlier visit that finished loading and selected reports that are not in Onyx yet
        await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, false);
        await waitForBatchedUpdates();

        // When the user opens the bulk change approver menu before this visit's request starts
        render(<SearchChangeApproverPage />);

        // Then the spinner shows instead of the unavailable view
        expect(FullScreenLoadingIndicator).toHaveBeenCalled();
        expect(FullPageNotFoundView).not.toHaveBeenCalled();

        // When the request starts and then returns the reports
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, true);
            await waitForBatchedUpdates();
            await loadReports([CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.ADMIN]);
        });

        // Then the picker shows the options without ever showing the unavailable view
        expect(FullPageNotFoundView).not.toHaveBeenCalledWith(expect.objectContaining({shouldShow: true}), undefined);
        const props = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(props?.data?.map((option) => option.keyForList)).toEqual([APPROVER_TYPE.ADD_APPROVER, APPROVER_TYPE.BYPASS_APPROVER, APPROVER_TYPE.REASSIGN_APPROVER]);
    });

    it('does not open Add approver on its own when a selected report is approved while Reassign is selected', async () => {
        // Given an admin who selected Reassign for reports that await approval
        await loadReports([CONST.POLICY.ROLE.ADMIN, CONST.POLICY.ROLE.ADMIN]);
        render(<SearchChangeApproverPage />);
        const reassignOption = jest
            .mocked(SelectionList)
            .mock.calls.at(-1)?.[0]
            ?.data?.find((option) => option.keyForList === APPROVER_TYPE.REASSIGN_APPROVER);
        act(() => {
            if (!reassignOption) {
                return;
            }
            jest.mocked(SelectionList).mock.calls.at(-1)?.[0]?.onSelectRow?.(reassignOption);
        });

        // When another approver approves one of the selected reports
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}reportA`, {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});
            await waitForBatchedUpdates();
        });

        // Then Add approver is hidden and the picker does not navigate anywhere without the user's choice
        const props = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(props?.data?.map((option) => option.keyForList)).not.toContain(APPROVER_TYPE.ADD_APPROVER);
        expect(props?.data?.some((option) => option.isSelected)).toBe(false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('waits for permissions before closing or automatically navigating', async () => {
        // Given selected reports whose permissions have not loaded yet
        await Onyx.set(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE, true);
        render(<SearchChangeApproverPage />);
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the reports and member permissions arrive
        await act(async () => {
            await loadReports([CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.USER]);
        });

        // Then the flow opens Reassign exactly once instead of closing during loading
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.CHANGE_APPROVER_REASSIGN_APPROVER_SEARCH_RHP);
    });
});
