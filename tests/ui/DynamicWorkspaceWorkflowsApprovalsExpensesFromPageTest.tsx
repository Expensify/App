import {act, render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';

import DynamicWorkspaceWorkflowsApprovalsExpensesFromPage from '@pages/workspace/workflows/approvals/DynamicWorkspaceWorkflowsApprovalsExpensesFromPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import type {PropsWithChildren} from 'react';
import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import getOnyxValue from '../utils/getOnyxValue';
import {getShowConfirmModalOption, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workflow-expenses-from-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const BOB_EMAIL = 'bob@example.com';
const CAROL_EMAIL = 'carol@example.com';

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

// The tests select members through the callback the page hands the list, so the list itself renders nothing.
jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn(() => ({
        setSearchTerm: jest.fn(),
        debouncedSearchTerm: '',
        availableOptions: {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: null},
        areOptionsInitialized: true,
    })),
);

function buildPolicy(): Policy {
    const employeeList: PolicyEmployeeList = {};
    for (const email of [ADMIN_EMAIL, BOB_EMAIL, CAROL_EMAIL]) {
        employeeList[email] = {email, submitsTo: ADMIN_EMAIL, role: email === ADMIN_EMAIL ? CONST.POLICY.ROLE.ADMIN : CONST.POLICY.ROLE.USER};
    }
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        approver: ADMIN_EMAIL,
        employeeList,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
    } as Policy;
}

async function renderPage(action: ValueOf<typeof CONST.APPROVAL_WORKFLOW.ACTION>, memberEmails: string[]) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, {...INITIAL_APPROVAL_WORKFLOW, action, members: memberEmails.map((email) => ({email, displayName: email}))});
    });
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicWorkspaceWorkflowsApprovalsExpensesFromPage
                // @ts-expect-error - the page only reads route.params
                route={{params: {policyID: POLICY_ID}}}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

/** Selects a member the way ApproverSelectionList does: by handing back the current selection plus that member. */
async function selectMember(email: string) {
    const listProps = jest.mocked(ApproverSelectionList).mock.lastCall?.[0];
    const member = listProps?.allApprovers.find((approver) => approver.login === email);
    if (!listProps || !member) {
        throw new Error(`${email} is not in the member list`);
    }
    const selectedMembers = listProps.allApprovers.filter((approver) => approver.isSelected);
    await act(async () => {
        listProps.onSelectApprover?.([...selectedMembers, {...member, isSelected: true}]);
    });
    await waitForBatchedUpdatesWithAct();
}

async function getWorkflowMemberEmails() {
    const approvalWorkflow = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
    return approvalWorkflow?.members.map((member) => member.email);
}

describe('DynamicWorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        jest.mocked(ApproverSelectionList).mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
            await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: 1});
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('warns before moving everyone into a new workflow and adds the last member once confirmed', async () => {
        // Given a new workflow that already has every workspace member except Carol
        await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.CREATE, [ADMIN_EMAIL, BOB_EMAIL]);

        // When the admin selects Carol, the last member left
        await selectMember(CAROL_EMAIL);

        // Then the admin is warned that every other workflow will be deleted, and Carol is not added until they confirm
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe(translateLocal('workflowsExpensesFromPage.moveEveryoneToThisWorkflowTitle'));
        expect(getShowConfirmModalOption('prompt')).toBe(translateLocal('workflowsExpensesFromPage.moveEveryoneToThisWorkflowPrompt'));
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);

        // When the admin confirms
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await waitForBatchedUpdatesWithAct();

        // Then everyone is in the new workflow
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL, CAROL_EMAIL]);
    });

    it('leaves the last member out of the new workflow when the admin cancels the warning', async () => {
        // Given a new workflow that already has every workspace member except Carol
        await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.CREATE, [ADMIN_EMAIL, BOB_EMAIL]);

        // When the admin selects Carol and then cancels the warning
        await selectMember(CAROL_EMAIL);
        resolveShowConfirmModal({action: MockModalActions.CLOSE});
        await waitForBatchedUpdatesWithAct();

        // Then Carol stays out of the new workflow, so the existing workflows are kept
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
    });

    it('does not warn while other members are still unselected', async () => {
        // Given a new workflow with only the admin in it
        await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.CREATE, [ADMIN_EMAIL]);

        // When the admin selects Bob, leaving Carol out
        await selectMember(BOB_EMAIL);

        // Then Bob is added right away because not everyone is moving into the new workflow
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
    });

    it('warns before moving everyone into an existing workflow and adds the last member once confirmed', async () => {
        // Given an existing workflow being edited that has every workspace member except Carol
        await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, [ADMIN_EMAIL, BOB_EMAIL]);

        // When the admin selects Carol, the last member left
        await selectMember(CAROL_EMAIL);

        // Then the admin gets the same warning as when creating a workflow, and Carol is not added until they confirm
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe(translateLocal('workflowsExpensesFromPage.moveEveryoneToThisWorkflowTitle'));
        expect(getShowConfirmModalOption('prompt')).toBe(translateLocal('workflowsExpensesFromPage.moveEveryoneToThisWorkflowPrompt'));
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);

        // When the admin confirms
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});
        await waitForBatchedUpdatesWithAct();

        // Then everyone is in the edited workflow
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL, CAROL_EMAIL]);
    });
});
