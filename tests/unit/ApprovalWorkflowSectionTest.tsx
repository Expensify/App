import {fireEvent, render, screen} from '@testing-library/react-native';

import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';

import React from 'react';

function mockTranslate(key: string, params?: {amount?: string}): string {
    switch (key) {
        case 'workflowsPage.ifReportIsOver':
            return `If report is over ${params?.amount}`;
        case 'workflowsPage.finalApprover':
            return 'Final approver';
        case 'workflowsPage.editWorkflowAction':
            return 'Edit';
        case 'workflowsPage.approver':
            return 'Approver';
        case 'workflowsPage.addApprovalTip':
            return 'Tip';
        case 'workflowsExpensesFromPage.title':
            return 'Expenses from';
        case 'workspace.common.everyone':
            return 'Everyone';
        case 'workflowsPage.accessibilityLabel':
            return 'workflow accessibility';
        default:
            return key;
    }
}

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: mockTranslate,
        toLocaleOrdinal: (n: number) => String(n),
        toLocaleOrdinalWithWords: (n: number) => ['First', 'Second', 'Third'].at(n - 1) ?? String(n),
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

const baseWorkflow: ApprovalWorkflow = {
    isDefault: false,
    members: [
        {
            email: 'user@example.com',
            displayName: 'Test User',
        },
    ],
    approvers: [
        {
            email: 'approver@example.com',
            displayName: 'Approver One',
        },
    ],
};

function renderSection(props: React.ComponentProps<typeof ApprovalWorkflowSection>) {
    return render(
        <OnyxListItemProvider>
            <ApprovalWorkflowSection {...props} />
        </OnyxListItemProvider>,
    );
}

describe('ApprovalWorkflowSection', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Edit pill that triggers the onPress handler', () => {
        const onPress = jest.fn();
        renderSection({approvalWorkflow: baseWorkflow, onPress});

        const editButton = screen.getByLabelText('Edit');
        expect(editButton).toBeTruthy();
        fireEvent.press(editButton);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('hides the Edit pill when the section is disabled (no-op for read-only workflows)', () => {
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), isDisabled: true});

        expect(screen.queryByLabelText('Edit')).toBeNull();
    });

    it('shows an error under an approver who is no longer a workspace member', () => {
        // Given a workflow whose approver was removed from the workspace without reassigning its members
        const brokenWorkflow: ApprovalWorkflow = {...baseWorkflow, approvers: [{email: 'removed@example.com', displayName: 'removed@example.com', isNotWorkspaceMember: true}]};

        // When the workflow card renders
        renderSection({approvalWorkflow: brokenWorkflow, onPress: jest.fn()});

        // Then the admin sees an error telling them to fix it
        expect(screen.getByText('workflowsPage.approverNotWorkspaceMember')).toBeTruthy();
    });

    it('does not show the non-member error for a regular approver', () => {
        // Given a workflow whose approver is a workspace member
        // When the workflow card renders
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn()});

        // Then no error is shown
        expect(screen.queryByText('workflowsPage.approverNotWorkspaceMember')).toBeNull();
    });

    it('reads the non-member error out through the Edit button, since the approver rows are hidden from screen readers', () => {
        // Given a workflow whose approver was removed from the workspace
        const brokenWorkflow: ApprovalWorkflow = {...baseWorkflow, approvers: [{email: 'removed@example.com', displayName: 'removed@example.com', isNotWorkspaceMember: true}]};

        // When the workflow card renders
        renderSection({approvalWorkflow: brokenWorkflow, onPress: jest.fn()});

        // Then the Edit button's label carries the error, so screen reader users hear what needs fixing
        expect(screen.getByLabelText('Edit, workflowsPage.approverNotWorkspaceMember')).toBeTruthy();
    });

    it('does not offer deleting the default workflow when its approver is no longer a workspace member', () => {
        // Given the default workflow, whose approver was removed from the workspace
        const brokenDefaultWorkflow: ApprovalWorkflow = {
            ...baseWorkflow,
            isDefault: true,
            approvers: [{email: 'removed@example.com', displayName: 'removed@example.com', isNotWorkspaceMember: true}],
        };

        // When the workflow card renders
        renderSection({approvalWorkflow: brokenDefaultWorkflow, onPress: jest.fn()});

        // Then the error only asks for a new approver, since the default workflow can't be deleted
        expect(screen.getByText('workflowsPage.defaultWorkflowApproverNotWorkspaceMember')).toBeTruthy();
        expect(screen.queryByText('workflowsPage.approverNotWorkspaceMember')).toBeNull();
    });

    it('names a lone approver without a position', () => {
        // Given a workflow with a single approver
        // When the workflow card renders
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn()});

        // Then there's no first or final approver to tell apart, so they're just the approver
        expect(screen.getByText('Approver')).toBeTruthy();
    });

    it('names the approvers from the first to the final one, and each optional over-limit approver after the amount they get the reports over', () => {
        // Given a workflow whose first approver is followed by two optional over-limit approvers and then one more approver
        const overLimitWorkflow: ApprovalWorkflow = {
            ...baseWorkflow,
            approvers: [
                {email: 'alice@example.com', displayName: 'Alice'},
                {email: 'brandon@example.com', displayName: 'Brandon', overLimitAmount: 100000},
                {email: 'cathy@example.com', displayName: 'Cathy', overLimitAmount: 200000},
                {email: 'charlie@example.com', displayName: 'Charlie'},
            ],
        };

        // When the workflow card renders
        renderSection({approvalWorkflow: overLimitWorkflow, onPress: jest.fn()});

        // Then the over-limit approvers are named after their amounts, and the approver after them is the final one since they don't count
        expect(screen.getByText('First approver')).toBeTruthy();
        expect(screen.getAllByText(/^If report is over/)).toHaveLength(2);
        expect(screen.getByText('Final approver')).toBeTruthy();
    });

    it('does not name an approver final when an optional over-limit approver comes after them', () => {
        // Given a workflow where an optional over-limit approver gets the reports over an amount after the last regular approver
        const overLimitWorkflow: ApprovalWorkflow = {
            ...baseWorkflow,
            approvers: [
                {email: 'alice@example.com', displayName: 'Alice'},
                {email: 'erica@example.com', displayName: 'Erica', overLimitAmount: 100000},
                {email: 'joe@example.com', displayName: 'Joe'},
                {email: 'cathy@example.com', displayName: 'Cathy', overLimitAmount: 200000},
            ],
        };

        // When the workflow card renders
        renderSection({approvalWorkflow: overLimitWorkflow, onPress: jest.fn()});

        // Then the last regular approver is named by their place, since reports over the last amount still go to someone after them
        expect(screen.getByText('First approver')).toBeTruthy();
        expect(screen.getByText('Second approver')).toBeTruthy();
        expect(screen.queryByText('Final approver')).toBeNull();
    });

    it('does not show the non-member error to someone who cannot edit the workflow', () => {
        // Given a workflow whose approver was removed from the workspace, shown read-only
        const brokenWorkflow: ApprovalWorkflow = {...baseWorkflow, approvers: [{email: 'removed@example.com', displayName: 'removed@example.com', isNotWorkspaceMember: true}]};

        // When the workflow card renders disabled
        renderSection({approvalWorkflow: brokenWorkflow, onPress: jest.fn(), isDisabled: true});

        // Then no error is shown, since there is no Edit button to act on it
        expect(screen.queryByText('workflowsPage.approverNotWorkspaceMember')).toBeNull();
    });

    describe('of a workflow whose employee settings fork some reports away from it', () => {
        // Cathy's employee settings send the reports over 2,000.00 that reach her to Denise, instead of on to Charlie
        const forkedWorkflow: ApprovalWorkflow = {
            ...baseWorkflow,
            approvers: [
                {email: 'alice@example.com', displayName: 'Alice'},
                {email: 'cathy@example.com', displayName: 'Cathy', overLimitAmount: 200000, forkBranches: [{approvers: [{email: 'denise@example.com', displayName: 'Denise'}]}]},
                {email: 'charlie@example.com', displayName: 'Charlie'},
            ],
        };

        it('shows a warning on the approver the fork leaves from, which opens the forks', () => {
            // Given the workflow card renders for an admin
            const onForkPress = jest.fn();
            renderSection({approvalWorkflow: forkedWorkflow, onPress: jest.fn(), onForkPress});

            // When the admin presses the warning
            fireEvent.press(screen.getByLabelText('workflowsPage.approvalForkTooltip'));

            // Then only Cathy has one, since the routing her fork explains leaves from her, and it opens the forks
            expect(screen.getAllByLabelText('workflowsPage.approvalForkTooltip')).toHaveLength(1);
            expect(onForkPress).toHaveBeenCalledTimes(1);
        });

        it('does not show the warning to someone who cannot edit the workflow', () => {
            // Given the workflow card renders read-only
            // When it renders
            renderSection({approvalWorkflow: forkedWorkflow, onPress: jest.fn(), onForkPress: jest.fn(), isDisabled: true});

            // Then there's no warning, since they can't remove the fork it leads to
            expect(screen.queryByLabelText('workflowsPage.approvalForkTooltip')).toBeNull();
        });
    });
});
