/** Approval rows keep their pills, navigation and error feedback when composed. */
import {fireEvent, render, screen, within} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';

import Navigation from '@libs/Navigation/Navigation';
import type * as WorkflowUtils from '@libs/WorkflowUtils';

import ApprovalWorkflowEditor from '@pages/workspace/workflows/approvals/ApprovalWorkflowEditor';
import WorkspaceWorkflowsApprovalsApprovalLimitPage from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApprovalLimitPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ApprovalWorkflowOnyx, Policy} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

const policyID = 'approval-menu-test';
const pressEvent = {nativeEvent: {}};
const mockApprovalWorkflowKey = ONYXKEYS.APPROVAL_WORKFLOW;
const mockAdditionalApproverEmail = 'additional@example.com';
let mockWorkflow: ApprovalWorkflowOnyx;
type NativeText = React.ComponentType<React.PropsWithChildren>;

jest.mock('@hooks/useOnyx', () => (key: string) => [key === mockApprovalWorkflowKey ? mockWorkflow : undefined]);
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    formatPhoneNumber: (name: string) => name,
    toLocaleOrdinalWithWords: (index: number) => String(index),
    localeCompare: (a: string, b: string) => a.localeCompare(b),
}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, convertToDisplayString: () => '$10.00'})}));
jest.mock('@hooks/useShouldUseApprovalWorkflowRules', () => () => false);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({login: 'admin@example.com'}));
jest.mock('@hooks/usePersonalDetailsByEmail', () => () => ({[mockAdditionalApproverEmail]: {displayName: 'Additional Approver'}}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    canMemberWrite: () => true,
    shouldHideDynamicExternalWorkflowPeople: () => false,
}));
jest.mock('@libs/WorkflowUtils', () => ({
    ...jest.requireActual<typeof WorkflowUtils>('@libs/WorkflowUtils'),
    isApprovalWorkflowLockedByIntegration: () => false,
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => ({__esModule: true, default: (component: React.ComponentType) => component}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/FixedFooter',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/AmountForm', () => () => null);
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/UserPill', () => {
    const {Text} = jest.requireActual<{Text: NativeText}>('react-native');
    return ({displayName}: {displayName: string}) => <Text>{displayName}</Text>;
});

const policy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.CORPORATE, outputCurrency: CONST.CURRENCY.USD});

function renderEditor() {
    return render(
        <ApprovalWorkflowEditor
            approvalWorkflow={mockWorkflow}
            policy={policy}
            policyID={policyID}
            ref={null}
        />,
    );
}

function renderLimitPage(approverIndex = 0) {
    return render(
        <WorkspaceWorkflowsApprovalsApprovalLimitPage
            {...createMock<React.ComponentProps<typeof WorkspaceWorkflowsApprovalsApprovalLimitPage>>({route: {params: {policyID, approverIndex}}})}
            {...{policy}}
        />,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    mockWorkflow = {
        action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
        isDefault: false,
        members: [{email: 'member@example.com', displayName: 'Member One'}],
        approvers: [{email: 'approver@example.com', displayName: 'Approver One'}],
        availableMembers: [],
        usedApproverEmails: [],
        originalApprovers: [{email: 'approver@example.com', displayName: 'Approver One'}],
    };
});

describe('Approval workflow composed rows', () => {
    it('puts the member and approver pills in value leaves with readable names and keeps edit navigation', () => {
        // Given a workflow with one submitter and one approver
        const view = renderEditor();

        // When the approver row is pressed
        fireEvent.press(screen.getByRole('button', {name: 'Approver One'}), pressEvent);

        // Then its pills retain explicit text labels rather than an object-stringified accessible value
        expect(view.UNSAFE_getAllByType(MenuItem.FieldValue).at(0)).toHaveProperty('props.accessibilityLabel', 'Member One');
        expect(view.UNSAFE_getAllByType(MenuItem.FieldValue).at(1)).toHaveProperty('props.accessibilityLabel', 'Approver One');
        expect(screen.getByText('Member One')).toBeOnTheScreen();
        expect(screen.getByText('Approver One')).toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, 0));
    });

    it('keeps Everyone non-interactive in the default workflow', () => {
        // Given the default workflow whose submitters cannot be changed
        mockWorkflow.isDefault = true;

        // When its rows render
        renderEditor();

        // Then Everyone is still visible but is not a button
        expect(screen.getByText('workspace.common.everyone')).toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: 'workspace.common.everyone'})).toBeNull();
    });

    it('allows member pills to wrap without limiting the value to one line', () => {
        // Given several submitters whose real UserPills container can wrap on a narrow screen
        mockWorkflow.members = Array.from({length: 7}, (_, index) => ({email: `member${index}@example.com`, displayName: `Member ${index}`}));

        // When the editor composes the member value
        const view = renderEditor();

        // Then every visible pill is retained and the value does not truncate its wrapping container
        expect(view.UNSAFE_getAllByType(MenuItem.FieldValue).at(0)).toHaveProperty('props.numberOfLines', 0);
        for (const member of mockWorkflow.members) {
            expect(screen.getByText(member.displayName)).toBeOnTheScreen();
        }
    });

    it('retains red dots and plain member errors alongside HTML approver errors', () => {
        // Given invalid submitters and a removed approver
        mockWorkflow.errors = {members: 'common.error.fieldRequired'};
        mockWorkflow.approvers = [{email: 'removed@example.com', displayName: 'Removed Approver', isNotWorkspaceMember: true}];

        // When the editor renders validation feedback
        const view = renderEditor();

        // Then both affected rows show a dot and the approver error stays in its HTML leaf
        expect(screen.getAllByTestId('menu-item-brick-road-indicator')).toHaveLength(2);
        expect(screen.getByText('common.error.fieldRequired')).toBeOnTheScreen();
        expect(view.UNSAFE_getByType(MenuItem.HelpTextHTML).props.children).toBe('workflowsPage.approverNotWorkspaceMember');
    });

    it('preserves an empty approver field and the create-flow selector', () => {
        // Given an unfinished new workflow
        mockWorkflow.action = CONST.APPROVAL_WORKFLOW.ACTION.CREATE;
        mockWorkflow.approvers = [undefined];

        // When its empty approver row is pressed
        const view = renderEditor();
        const root = view.UNSAFE_getAllByType(MenuItem.Root).find(({props}) => props.sentryLabel === CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_EDITOR_APPROVER);
        if (!root) {
            throw new Error('Expected an approver row');
        }
        fireEvent.press(within(root).getByRole('button'), pressEvent);

        // Then the empty value remains a placeholder, and selection goes to the first approver step
        expect(view.UNSAFE_getAllByType(MenuItem.FieldValue)).toHaveLength(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, 0));
    });

    it('keeps the shared-workflow hint as a press target for editing its approver', () => {
        // Given an approver who is also used by another workflow
        mockWorkflow.usedApproverEmails = ['approver@example.com'];
        renderEditor();

        // When the admin presses the hint rather than the pill
        fireEvent.press(screen.getByText('workflowsPage.approverInMultipleWorkflows'), pressEvent);

        // Then the existing approver editor still opens
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, 0));
    });

    it('preserves the primary approver change action in the redesigned editor', () => {
        // Given an existing workflow with its primary approver
        renderLimitPage();

        // When the named primary approver is pressed
        fireEvent.press(screen.getByRole('button', {name: 'Approver One'}), pressEvent);

        // Then the current approver-change route opens without restoring the removed over-limit picker
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE.getRoute(policyID, 0));
    });

    it('retains conditional approver titles and edit navigation', () => {
        // Given an additional approver who only receives reports over a set amount
        mockWorkflow.approvers.push({email: 'additional@example.com', displayName: 'Additional Approver', overLimitAmount: 1000});

        // When the composed additional approver row is pressed
        renderEditor();
        fireEvent.press(screen.getByRole('button', {name: 'Additional Approver'}), pressEvent);

        // Then the new conditional title and approval-limit destination are retained
        expect(screen.getByText('workflowsPage.ifReportIsOver')).toBeOnTheScreen();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID, 1));
    });

    it('does not restore the removed additional-approver picker when the primary approver is missing', () => {
        // Given an edit flow with an unselected primary approver
        mockWorkflow.approvers = [undefined];

        // When the redesigned approval-limit editor renders
        const view = renderLimitPage();

        // Then only the primary approver field remains, without an obsolete disabled picker
        expect(view.UNSAFE_getAllByType(MenuItem.Root)).toHaveLength(1);
        expect(screen.queryByText('workflowsApprovalLimitPage.additionalApproverLabel')).toBeNull();
    });
});
