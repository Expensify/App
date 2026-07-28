import {render} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';

import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';

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
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
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
    });

    /**
     * Regression test for https://github.com/Expensify/App/issues/96975
     *
     * When a workspace admin sets "Manually approve all expenses over X" in Classic Expensify,
     * the backend writes autoApproval.limit but never writes shouldShowAutoApprovalOptions
     * (a NewDot-only flag). The "Auto-approve compliant reports" toggle reads only
     * shouldShowAutoApprovalOptions for its active state, so the toggle shows OFF despite
     * a non-zero limit being configured.
     */
    it('shows the auto-approve toggle as active when autoApproval.limit is set by Classic and shouldShowAutoApprovalOptions is absent', () => {
        (mockedUsePolicy as jest.Mock).mockReturnValue({
            id: POLICY_ID,
            // autoApproval.limit is set by Classic's "Manually approve all expenses over" field.
            // shouldShowAutoApprovalOptions is intentionally absent — Classic never writes this flag.
            autoApproval: {limit: 5000},
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });

        renderSection();

        const autoApproveProps = mockedToggleSettingOptionRow.mock.calls[AUTO_APPROVE_TOGGLE_INDEX]?.[0];
        expect(autoApproveProps).toBeDefined();
        expect(autoApproveProps?.isActive).toBe(true);
    });
});
