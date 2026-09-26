import {render} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';

import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {enablePolicyAutoReimbursementLimit} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Section',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: () => '$50.00'}),
}));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: 'https://new.expensify.com'})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, ...args: unknown[]) => [key, ...args].join('|'),
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    getReimbursementChoice: jest.fn((policy?: {reimbursementChoice?: string}) => policy?.reimbursementChoice),
    getWorkflowApprovalsUnavailable: jest.fn(() => false),
    isControlPolicy: jest.fn(() => true),
}));

jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => jest.fn(() => null));

jest.mock('@userActions/Policy/Policy', () => ({
    enableAutoApprovalOptions: jest.fn(),
    enablePolicyAutoReimbursementLimit: jest.fn(),
    setPolicyPreventSelfApproval: jest.fn(),
}));

const mockedUsePolicy = jest.mocked(usePolicy);
const mockedToggleSettingOptionRow = jest.mocked(ToggleSettingOptionRow);

const POLICY_ID = 'POLICY_1';

// optionItems order: 0=preventSelfApproval, 1=autoApproveCompliantReports, 2=autoPayApprovedReports
const AUTO_APPROVE_TOGGLE_INDEX = 1;
const AUTO_PAY_TOGGLE_INDEX = 2;

const AUTO_PAY_UPGRADE_ROUTE = ROUTES.WORKSPACE_UPGRADE.getRoute(POLICY_ID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoPayApprovedReports.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID));

const PAYMENTS_ENABLED_POLICY = {
    id: POLICY_ID,
    areWorkflowsEnabled: true,
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
    achAccount: {bankAccountID: 1234},
};

const mockedIsControlPolicy = jest.mocked(isControlPolicy);

function getAutoPayProps() {
    const autoPayProps = mockedToggleSettingOptionRow.mock.calls.at(AUTO_PAY_TOGGLE_INDEX)?.[0];
    expect(autoPayProps).toBeDefined();
    return autoPayProps;
}

function renderSection() {
    return render(
        <ExpenseReportRulesSection
            policyID={POLICY_ID}
            canWriteApprovals
            canWritePayments
            withApprovalsReadOnlyFallback={jest.fn(() => undefined)}
            withPaymentsReadOnlyFallback={jest.fn(() => undefined)}
        />,
    );
}

describe('ExpenseReportRulesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedIsControlPolicy.mockReturnValue(true);
    });

    it('shows the auto-approve toggle as active when autoApproval.limit is set by Classic and shouldShowAutoApprovalOptions is absent', () => {
        (mockedUsePolicy as jest.Mock).mockReturnValue({
            id: POLICY_ID,
            // autoApproval.limit is set by Classic's "Manually approve all expenses over" field.
            // shouldShowAutoApprovalOptions is intentionally absent — Classic never writes this flag.
            autoApproval: {limit: 5000},
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });

        renderSection();

        const autoApproveProps = mockedToggleSettingOptionRow.mock.calls.at(AUTO_APPROVE_TOGGLE_INDEX)?.[0];
        expect(autoApproveProps).toBeDefined();
        expect(autoApproveProps?.isActive).toBe(true);
    });

    describe('auto-pay approved reports', () => {
        it('tells a non-Control workspace with payments set up that auto-pay requires the Control plan', () => {
            mockedIsControlPolicy.mockReturnValue(false);
            (mockedUsePolicy as jest.Mock).mockReturnValue(PAYMENTS_ENABLED_POLICY);

            renderSection();

            const autoPayProps = getAutoPayProps();
            expect(autoPayProps?.subtitle).toBe(`workspace.rules.expenseReportRules.autoPayApprovedReportsControlPlanSubtitle|https://new.expensify.com/${AUTO_PAY_UPGRADE_ROUTE}`);
            expect(autoPayProps?.shouldParseSubtitle).toBe(true);
            expect(autoPayProps?.showLockIcon).toBe(true);
            expect(autoPayProps?.disabled).toBe(false);

            autoPayProps?.onToggle(true);
            expect(Navigation.navigate).toHaveBeenCalledWith(AUTO_PAY_UPGRADE_ROUTE);
            expect(enablePolicyAutoReimbursementLimit).not.toHaveBeenCalled();
        });

        it('shows the Control plan copy instead of the payments copy on a non-Control workspace without payments, and keeps the upgrade path reachable', () => {
            mockedIsControlPolicy.mockReturnValue(false);
            (mockedUsePolicy as jest.Mock).mockReturnValue({
                ...PAYMENTS_ENABLED_POLICY,
                achAccount: undefined,
            });

            renderSection();

            const autoPayProps = getAutoPayProps();
            expect(autoPayProps?.subtitle).toBe(`workspace.rules.expenseReportRules.autoPayApprovedReportsControlPlanSubtitle|https://new.expensify.com/${AUTO_PAY_UPGRADE_ROUTE}`);
            expect(autoPayProps?.showLockIcon).toBe(true);
            expect(autoPayProps?.disabled).toBe(false);
        });

        it('keeps the payments copy and locks the toggle on a Control workspace without a bank account', () => {
            (mockedUsePolicy as jest.Mock).mockReturnValue({
                ...PAYMENTS_ENABLED_POLICY,
                achAccount: undefined,
            });

            renderSection();

            const autoPayProps = getAutoPayProps();
            expect(autoPayProps?.subtitle).toBe('workspace.rules.expenseReportRules.unlockFeatureEnableWorkflowsSubtitle|common.payments');
            expect(autoPayProps?.shouldParseSubtitle).toBe(true);
            expect(autoPayProps?.showLockIcon).toBe(true);
            expect(autoPayProps?.disabled).toBe(true);
        });

        it('unlocks the toggle on a Control workspace with payments set up', () => {
            (mockedUsePolicy as jest.Mock).mockReturnValue(PAYMENTS_ENABLED_POLICY);

            renderSection();

            const autoPayProps = getAutoPayProps();
            expect(autoPayProps?.subtitle).toBe('workspace.rules.expenseReportRules.autoPayApprovedReportsSubtitle');
            expect(autoPayProps?.shouldParseSubtitle).toBe(false);
            expect(autoPayProps?.showLockIcon).toBe(false);
            expect(autoPayProps?.disabled).toBe(false);

            autoPayProps?.onToggle(true);
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(enablePolicyAutoReimbursementLimit).toHaveBeenCalledWith(POLICY_ID, true, undefined, undefined);
        });
    });
});
