import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';

let mockIsCustomAgentBetaEnabled = false;

const translations: Record<string, string> = {
    'workflowsPage.editWorkflowAction': 'Edit',
    'workflowsPage.addAgentAction': 'Add agent',
    'workflowsPage.approver': 'Approver',
    'workflowsPage.addApprovalTip': 'Tip',
    'workflowsExpensesFromPage.title': 'Expenses from',
    'workspace.common.everyone': 'Everyone',
    'workflowsPage.accessibilityLabel': 'workflow accessibility',
};

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => translations[key] ?? key,
        toLocaleOrdinal: (n: number) => String(n),
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({
        isBetaEnabled: () => mockIsCustomAgentBetaEnabled,
    }),
}));

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
        mockIsCustomAgentBetaEnabled = false;
        jest.clearAllMocks();
    });

    it('renders the Edit pill that triggers the onPress handler', () => {
        const onPress = jest.fn();
        renderSection({approvalWorkflow: baseWorkflow, onPress, onAddAgentPress: jest.fn(), canAddAgent: true});

        const editButton = screen.getByLabelText('Edit');
        expect(editButton).toBeTruthy();
        fireEvent.press(editButton);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not show the Add agent pill when the customAgent beta is disabled', () => {
        mockIsCustomAgentBetaEnabled = false;
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), onAddAgentPress: jest.fn(), canAddAgent: true});

        expect(screen.queryByLabelText('Add agent')).toBeNull();
    });

    it('shows the Add agent pill when the customAgent beta is enabled and the caller allows it', () => {
        mockIsCustomAgentBetaEnabled = true;
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), onAddAgentPress: jest.fn(), canAddAgent: true});

        expect(screen.getByLabelText('Add agent')).toBeTruthy();
    });

    it('does not show the Add agent pill when canAddAgent is false even if the beta is on', () => {
        mockIsCustomAgentBetaEnabled = true;
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), onAddAgentPress: jest.fn(), canAddAgent: false});

        expect(screen.queryByLabelText('Add agent')).toBeNull();
    });

    it('invokes onAddAgentPress when the Add agent pill is pressed', () => {
        mockIsCustomAgentBetaEnabled = true;
        const onAddAgentPress = jest.fn();
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), onAddAgentPress, canAddAgent: true});

        fireEvent.press(screen.getByLabelText('Add agent'));
        expect(onAddAgentPress).toHaveBeenCalledTimes(1);
    });

    it('hides both pill actions when the section is disabled (no-op for read-only workflows)', () => {
        mockIsCustomAgentBetaEnabled = true;
        renderSection({approvalWorkflow: baseWorkflow, onPress: jest.fn(), onAddAgentPress: jest.fn(), canAddAgent: true, isDisabled: true});

        expect(screen.queryByLabelText('Edit')).toBeNull();
        expect(screen.queryByLabelText('Add agent')).toBeNull();
    });
});
