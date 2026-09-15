import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import {isAllowedToApproveExpenseReport} from '@libs/ReportUtils';

import {ReportReassignApproverPage} from '@pages/ReportReassignApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 910001;
const CURRENT_MANAGER_ACCOUNT_ID = 910002;
const SUBMITTER_ACCOUNT_ID = 910003;
const ELIGIBLE_APPROVER_ACCOUNT_ID = 910004;
const CURRENT_MANAGER_EMAIL = 'current-manager@test.com';
const SUBMITTER_EMAIL = 'submitter@test.com';
const ELIGIBLE_APPROVER_EMAIL = 'eligible-approver@test.com';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@pages/ErrorPage/NotFoundPage', () => jest.fn(() => null));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: CURRENT_USER_ACCOUNT_ID,
    email: 'admin@test.com',
    login: 'admin@test.com',
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (value: string) => value,
    localeCompare: (firstValue: string, secondValue: string) => firstValue.localeCompare(secondValue),
}));
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/usePressLoading', () => () => ({isLoading: false, startWithLoading: (callback: () => void) => callback()}));
jest.mock('@hooks/useReportTransactions', () => () => []);
jest.mock('@hooks/useReportTransactionViolations', () => () => [{}]);

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        isAllowedToApproveExpenseReport: jest.fn(() => true),
    };
});

const mockSelectionList = jest.mocked(SelectionList);
const mockIsAllowedToApproveExpenseReport = jest.mocked(isAllowedToApproveExpenseReport);

const report = createMock<Report>({
    reportID: '910100',
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'reassign-policy',
    managerID: CURRENT_MANAGER_ACCOUNT_ID,
    ownerAccountID: SUBMITTER_ACCOUNT_ID,
});

function buildPolicy(role: Policy['role'] = CONST.POLICY.ROLE.ADMIN): Policy {
    return createMock<Policy>({
        id: report.policyID,
        role,
        employeeList: {
            [CURRENT_MANAGER_EMAIL]: {email: CURRENT_MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, role: CONST.POLICY.ROLE.USER},
            [ELIGIBLE_APPROVER_EMAIL]: {email: ELIGIBLE_APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
        },
    });
}

function renderPage(policy: Policy) {
    return render(
        <ReportReassignApproverPage
            // @ts-expect-error Only the report, policy, and loading state are read by the unwrapped page.
            route={{params: {reportID: report.reportID}}}
            report={report}
            policy={policy}
            isLoadingReportData={false}
        />,
    );
}

function getSubmitButtonDisabled() {
    const footerContent = mockSelectionList.mock.calls.at(-1)?.[0].footerContent;
    if (!React.isValidElement<{isDisabled?: boolean}>(footerContent)) {
        throw new Error('Expected the selection list to have a submit button');
    }
    return footerContent.props.isDisabled;
}

describe('ReportReassignApproverPage', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [CURRENT_MANAGER_ACCOUNT_ID]: buildPersonalDetails(CURRENT_MANAGER_EMAIL, CURRENT_MANAGER_ACCOUNT_ID, 'Current manager'),
            [SUBMITTER_ACCOUNT_ID]: buildPersonalDetails(SUBMITTER_EMAIL, SUBMITTER_ACCOUNT_ID, 'Submitter'),
            [ELIGIBLE_APPROVER_ACCOUNT_ID]: buildPersonalDetails(ELIGIBLE_APPROVER_EMAIL, ELIGIBLE_APPROVER_ACCOUNT_ID, 'Eligible approver'),
        });
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsAllowedToApproveExpenseReport.mockImplementation((_report, accountID) => accountID !== SUBMITTER_ACCOUNT_ID);
    });

    it('only lists members who can replace the current approver', () => {
        renderPage(buildPolicy());

        const data = mockSelectionList.mock.calls.at(-1)?.[0].data;
        expect(data).toEqual([expect.objectContaining({accountID: ELIGIBLE_APPROVER_ACCOUNT_ID, login: ELIGIBLE_APPROVER_EMAIL})]);
    });

    it('disables Save until an approver is selected', () => {
        renderPage(buildPolicy());

        expect(getSubmitButtonDisabled()).toBe(true);

        const selectionListProps = mockSelectionList.mock.calls.at(-1)?.[0];
        const selectedOption = selectionListProps?.data.at(0);
        if (!selectionListProps || !selectedOption) {
            throw new Error('Expected an eligible approver');
        }
        act(() => {
            selectionListProps.onSelectRow?.(selectedOption);
        });

        expect(getSubmitButtonDisabled()).toBe(false);
    });

    it('does not render the reassignment controls for non-admins', () => {
        renderPage(buildPolicy(CONST.POLICY.ROLE.USER));

        expect(mockSelectionList).not.toHaveBeenCalled();
    });
});
