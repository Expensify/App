import {act, render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';
import SelectionList from '@components/SelectionList';

import useStrictPolicyRules from '@hooks/useStrictPolicyRules';

import Navigation from '@libs/Navigation/Navigation';
import {isAllowedToApproveExpenseReport} from '@libs/ReportUtils';

import DynamicReportChangeApproverPage from '@pages/DynamicReportChangeApproverPage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {ReportReassignApproverPage} from '@pages/ReportReassignApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
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

jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@pages/ErrorPage/NotFoundPage', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/withReportOrNotFound', () => () => (component: React.ComponentType) => component);
jest.mock('@hooks/useDynamicBackPath', () => () => '');
jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: ''}));
jest.mock('@hooks/useStrictPolicyRules', () => jest.fn(() => ({areStrictPolicyRulesEnabled: false})));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), dismissToPreviousRHP: jest.fn()}));

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

const mockApproverSelectionList = jest.mocked(ApproverSelectionList);
const mockIsAllowedToApproveExpenseReport = jest.mocked(isAllowedToApproveExpenseReport);
const mockUseStrictPolicyRules = jest.mocked(useStrictPolicyRules);

const report = createMock<Report>({
    reportID: '910100',
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: 'reassign-policy',
    managerID: CURRENT_MANAGER_ACCOUNT_ID,
    ownerAccountID: SUBMITTER_ACCOUNT_ID,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
});

function buildPolicy(role: Policy['role'] = CONST.POLICY.ROLE.ADMIN): Policy {
    return createMock<Policy>({
        id: report.policyID,
        role,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        employeeList: {
            [CURRENT_MANAGER_EMAIL]: {email: CURRENT_MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            [SUBMITTER_EMAIL]: {email: SUBMITTER_EMAIL, role: CONST.POLICY.ROLE.USER},
            [ELIGIBLE_APPROVER_EMAIL]: {email: ELIGIBLE_APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
        },
    });
}

function renderPage(policy: Policy, reportOverride = report) {
    return render(
        <PersonalDetailsByLoginProvider>
            <ReportReassignApproverPage
                // @ts-expect-error Only the report, policy, and loading state are read by the unwrapped page.
                route={{params: {reportID: report.reportID}}}
                report={reportOverride}
                policy={policy}
                isLoadingReportData={false}
            />
        </PersonalDetailsByLoginProvider>,
    );
}

function getSubmitButtonDisabled() {
    const footerContent = mockApproverSelectionList.mock.calls.at(-1)?.[0].footerContent;
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
        mockUseStrictPolicyRules.mockReturnValue({
            areStrictPolicyRulesEnabled: false,
        });
        mockIsAllowedToApproveExpenseReport.mockImplementation((_report, accountID) => accountID !== SUBMITTER_ACCOUNT_ID);
    });

    it.each([
        {
            role: CONST.POLICY.ROLE.USER,
            isCurrentApprover: true,
            strictRules: false,
            isAllowed: true,
        },
        {
            role: CONST.POLICY.ROLE.USER,
            isCurrentApprover: true,
            strictRules: true,
            isAllowed: false,
        },
        {
            role: CONST.POLICY.ROLE.USER,
            isCurrentApprover: false,
            strictRules: false,
            isAllowed: false,
        },
        {
            role: CONST.POLICY.ROLE.ADMIN,
            isCurrentApprover: false,
            strictRules: false,
            isAllowed: true,
        },
        {
            role: CONST.POLICY.ROLE.ADMIN,
            isCurrentApprover: true,
            strictRules: true,
            isAllowed: true,
        },
    ])('checks reassignment access for $role with current approver=$isCurrentApprover and strict rules=$strictRules', ({role, isCurrentApprover, strictRules, isAllowed}) => {
        // Given the user's workspace role, report assignment, and domain restrictions
        mockUseStrictPolicyRules.mockReturnValue({
            areStrictPolicyRulesEnabled: strictRules,
        });
        const currentReport = {
            ...report,
            managerID: isCurrentApprover ? CURRENT_USER_ACCOUNT_ID : CURRENT_MANAGER_ACCOUNT_ID,
        };

        // When the user opens the reassignment page directly
        renderPage(buildPolicy(role), currentReport);

        // Then both the page and its shared list enforce the same permission
        const props = mockApproverSelectionList.mock.calls.at(-1)?.[0];
        expect(props?.shouldShowNotFoundView).toBe(!isAllowed);
        if (role === CONST.POLICY.ROLE.USER && isAllowed) {
            expect(props?.shouldRequirePolicyAdmin).toBe(false);
        }
    });

    it.each([CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.ADMIN])('offers only permitted approver actions for %s', (role) => {
        // Given a current approver whose domain does not enforce strict rules
        const currentReport = {...report, managerID: CURRENT_USER_ACCOUNT_ID};

        // When they open the change approver menu
        render(
            <DynamicReportChangeApproverPage
                // @ts-expect-error Only the report, policy, and loading state are read by the unwrapped page.
                route={{params: {reportID: report.reportID}}}
                report={currentReport}
                policy={buildPolicy(role)}
                isLoadingReportData={false}
            />,
        );

        // Then members can only reassign, while admins retain all three actions
        expect(NotFoundPage).not.toHaveBeenCalled();
        const props = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(props?.data?.map((option) => option.keyForList)).toEqual(role === CONST.POLICY.ROLE.ADMIN ? ['addApprover', 'bypassApprover', 'reassignApprover'] : ['reassignApprover']);
        if (role === CONST.POLICY.ROLE.USER) {
            expect(props?.data?.at(0)?.isSelected).toBe(true);
            act(() => props?.confirmButtonOptions?.onConfirm?.());
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_CHANGE_APPROVER_REASSIGN_APPROVER.getRoute(report.reportID));
        }
    });

    it.each([CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.ADMIN])('returns to the appropriate screen for %s', (role) => {
        // Given a current approver on the reassignment page with strict rules disabled
        renderPage(buildPolicy(role), {...report, managerID: CURRENT_USER_ACCOUNT_ID});

        // When the user presses Back
        act(() => mockApproverSelectionList.mock.calls.at(-1)?.[0].onBackButtonPress());

        // Then members return to the report while admins return to their action menu
        if (role === CONST.POLICY.ROLE.USER) {
            expect(Navigation.dismissToPreviousRHP).toHaveBeenCalledTimes(1);
            expect(Navigation.goBack).not.toHaveBeenCalled();
        } else {
            expect(Navigation.goBack).toHaveBeenCalledWith(`${ROUTES.REPORT_WITH_ID.getRoute(report.reportID)}/${DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path}`, {compareParams: false});
            expect(Navigation.dismissToPreviousRHP).not.toHaveBeenCalled();
        }
    });

    it('only lists members who can replace the current approver', () => {
        renderPage(buildPolicy());

        const data = mockApproverSelectionList.mock.calls.at(-1)?.[0].allApprovers;
        expect(data).toEqual([expect.objectContaining({value: ELIGIBLE_APPROVER_ACCOUNT_ID, login: ELIGIBLE_APPROVER_EMAIL})]);
    });

    it('disables Save until an approver is selected', () => {
        renderPage(buildPolicy());

        expect(getSubmitButtonDisabled()).toBe(true);

        const selectionListProps = mockApproverSelectionList.mock.calls.at(-1)?.[0];
        const selectedOption = selectionListProps?.allApprovers.at(0);
        if (!selectionListProps || !selectedOption) {
            throw new Error('Expected an eligible approver');
        }
        act(() => {
            selectionListProps.onSelectApprover?.([selectedOption]);
        });

        expect(getSubmitButtonDisabled()).toBe(false);
    });

    it('passes the policy to the shared list so it blocks non-admins', () => {
        const policy = buildPolicy(CONST.POLICY.ROLE.USER);
        renderPage(policy);

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(expect.objectContaining({policy}), undefined);
    });

    it('shows the not-found view when the report is no longer processing', () => {
        renderPage(buildPolicy(), {...report, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});

        expect(mockApproverSelectionList).toHaveBeenLastCalledWith(expect.objectContaining({shouldShowNotFoundView: true}), undefined);
    });
});
