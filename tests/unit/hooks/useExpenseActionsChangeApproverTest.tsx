import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useExpenseActions from '@hooks/useExpenseActions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 123;
const REPORT_ID = '910100';
const POLICY_ID = 'approver-policy';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: CURRENT_USER_ACCOUNT_ID, email: 'approver@test.com', login: 'approver@test.com'}));
jest.mock('@hooks/useStrictPolicyRules', () => jest.fn(() => ({areStrictPolicyRulesEnabled: false})));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn(), closeModal: jest.fn()}));
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({useMoneyReportTransactionThread: () => ({reportActions: []})}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn(() => 'r/910100/change-approver'));

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <LocaleContextProvider>{children}</LocaleContextProvider>
    </OnyxListItemProvider>
);

describe('useExpenseActions change approver navigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => undefined);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        {role: CONST.POLICY.ROLE.USER, managerID: CURRENT_USER_ACCOUNT_ID, strictRules: false, shouldSkipMenu: true},
        {role: CONST.POLICY.ROLE.ADMIN, managerID: CURRENT_USER_ACCOUNT_ID, strictRules: false, shouldSkipMenu: false},
        {role: CONST.POLICY.ROLE.ADMIN, managerID: 456, strictRules: true, shouldSkipMenu: false},
        {role: CONST.POLICY.ROLE.USER, managerID: CURRENT_USER_ACCOUNT_ID, strictRules: true, shouldSkipMenu: false},
        {role: CONST.POLICY.ROLE.USER, managerID: 456, strictRules: false, shouldSkipMenu: false},
    ])('routes $role with manager=$managerID and strict rules=$strictRules', async ({role, managerID, strictRules, shouldSkipMenu}) => {
        // Given a report with the user's workspace role and current approver assignment
        jest.mocked(useStrictPolicyRules).mockReturnValue({areStrictPolicyRulesEnabled: strictRules});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createMock<Policy>({id: POLICY_ID, role}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMock<Report>({reportID: REPORT_ID, policyID: POLICY_ID, managerID, type: CONST.REPORT.TYPE.EXPENSE}));
        await waitForBatchedUpdatesWithAct();
        const {result} = renderHook(() => useExpenseActions({reportID: REPORT_ID}), {wrapper});

        // When Change approver is selected from the report's actions
        act(() => result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER]?.onSelected?.());

        // Then only eligible non-admin current approvers skip the menu
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        if (shouldSkipMenu) {
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_CHANGE_APPROVER_REASSIGN_APPROVER.getRoute(REPORT_ID));
            expect(createDynamicRoute).not.toHaveBeenCalled();
        } else {
            expect(createDynamicRoute).toHaveBeenCalledWith(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path);
            expect(Navigation.navigate).toHaveBeenCalledWith('r/910100/change-approver');
        }
    });
});
