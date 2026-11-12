import {act, render} from '@testing-library/react-native';

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
jest.mock('@components/FullscreenLoadingIndicator', () => () => null);
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
jest.mock('@hooks/useStrictPolicyRules', () => jest.fn(() => ({areStrictPolicyRulesEnabled: false})));
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
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: false});
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
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: strictRules});
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
