import {fireEvent, render, screen} from '@testing-library/react-native';

import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';

import React from 'react';

function mockTranslate(key: string): string {
    switch (key) {
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

    it('does not show the non-member error to someone who cannot edit the workflow', () => {
        // Given a workflow whose approver was removed from the workspace, shown read-only
        const brokenWorkflow: ApprovalWorkflow = {...baseWorkflow, approvers: [{email: 'removed@example.com', displayName: 'removed@example.com', isNotWorkspaceMember: true}]};

        // When the workflow card renders disabled
        renderSection({approvalWorkflow: brokenWorkflow, onPress: jest.fn(), isDisabled: true});

        // Then no error is shown, since there is no Edit button to act on it
        expect(screen.queryByText('workflowsPage.approverNotWorkspaceMember')).toBeNull();
    });
});
