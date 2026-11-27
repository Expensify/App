import {act, render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';

import {setApprovalWorkflowPendingInviteMembers} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
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
const INVITEE_EMAIL = 'invitee@example.com';
const INVITEE_ACCOUNT_ID = 4;

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

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
jest.mock('@hooks/usePersonalDetailSearchSelector', () => jest.fn());

function buildSearchSelector(): ReturnType<typeof usePersonalDetailSearchSelector> {
    return {
        setSearchTerm: jest.fn(),
        searchTerm: '',
        debouncedSearchTerm: '',
        availableOptions: {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: null, extraOptions: [], currentUserOption: null},
        selectedOptions: [],
        selectedNonExistingOptions: [],
        totalOptionsCount: 0,
        toggleSelection: jest.fn(),
        resetSelection: jest.fn(),
        areOptionsInitialized: true,
    };
}

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

function getPage() {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicWorkspaceWorkflowsApprovalsExpensesFromPage
                // @ts-expect-error - the page only reads route.params
                route={{params: {policyID: POLICY_ID}}}
            />
        </ComposeProviders>
    );
}

async function renderPage(action: ValueOf<typeof CONST.APPROVAL_WORKFLOW.ACTION>, memberEmails: string[]) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, {...INITIAL_APPROVAL_WORKFLOW, action, members: memberEmails.map((email) => ({email, displayName: email}))});
    });
    const rendered = render(getPage());
    await waitForBatchedUpdatesWithAct();
    return rendered;
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

function getSelectedMemberEmails() {
    return jest
        .mocked(ApproverSelectionList)
        .mock.lastCall?.[0].allApprovers.filter((member) => member.isSelected)
        .map((member) => member.login);
}

async function pressSave() {
    const footer = jest.mocked(ApproverSelectionList).mock.lastCall?.[0].footerContent;
    if (!React.isValidElement<{onSubmit: () => void}>(footer)) {
        throw new Error('Missing Save button');
    }
    await act(async () => footer.props.onSubmit());
    await waitForBatchedUpdatesWithAct();
}

describe('DynamicWorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        jest.mocked(usePersonalDetailSearchSelector).mockReturnValue(buildSearchSelector());
        jest.mocked(Navigation.goBack).mockClear();
        jest.mocked(Navigation.navigate).mockClear();
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

        // Then everyone is selected locally, without changing the parent before Next
        expect(getSelectedMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL, CAROL_EMAIL]);
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
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

        // Then Bob is selected locally without a warning, while the parent remains unchanged
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(getSelectedMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
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

        // Then everyone is selected locally, without changing the parent before Save
        expect(getSelectedMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL, CAROL_EMAIL]);
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
    });

    it.each(['header Back', 'route removal'])('discards tentative additions and removals on %s', async (exit) => {
        // Given an existing workflow with the admin selected
        const {unmount} = await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, [ADMIN_EMAIL]);

        // When the admin replaces their selection with Bob and leaves without Save
        await selectMember(BOB_EMAIL);
        const listProps = jest.mocked(ApproverSelectionList).mock.lastCall?.[0];
        await act(async () => {
            listProps?.onSelectApprover?.(listProps.allApprovers.filter((member) => member.login === BOB_EMAIL));
        });
        expect(getSelectedMemberEmails()).toEqual([BOB_EMAIL]);
        if (exit === 'header Back') {
            await act(async () => jest.mocked(ApproverSelectionList).mock.lastCall?.[0].onBackButtonPress?.());
        }
        unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the canceled selection never changes the parent draft
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
    });

    it('retains an accepted selection when the picker is reopened and canceled', async () => {
        // Given a nested picker where the admin adds Bob
        const firstPage = await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, [ADMIN_EMAIL]);
        await selectMember(BOB_EMAIL);

        // When Save accepts the selection, then a reopened picker removes Bob without saving
        await pressSave();
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
        firstPage.unmount();
        render(getPage());
        await waitForBatchedUpdatesWithAct();
        const listProps = jest.mocked(ApproverSelectionList).mock.lastCall?.[0];
        await act(async () => {
            listProps?.onSelectApprover?.(listProps.allApprovers.filter((member) => member.login === ADMIN_EMAIL));
        });
        await act(async () => jest.mocked(ApproverSelectionList).mock.lastCall?.[0].onBackButtonPress?.());

        // Then the previous Save is retained, not replaced by either the original or the canceled selection
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL, BOB_EMAIL]);
    });

    it('stages invitees separately and keeps tentative selections when invitations are canceled', async () => {
        // Given an existing workflow and a non-member returned by search
        const page = await renderPage(CONST.APPROVAL_WORKFLOW.ACTION.EDIT, [ADMIN_EMAIL]);
        const searchSelector = buildSearchSelector();
        jest.mocked(usePersonalDetailSearchSelector).mockReturnValue({
            ...searchSelector,
            debouncedSearchTerm: INVITEE_EMAIL,
            availableOptions: {
                ...searchSelector.availableOptions,
                userToInvite: {
                    keyForList: INVITEE_EMAIL,
                    login: INVITEE_EMAIL,
                    text: 'Invited member',
                    accountID: INVITEE_ACCOUNT_ID,
                    icons: [{source: 'avatar', id: INVITEE_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR}],
                },
            },
        });
        page.rerender(getPage());
        await waitForBatchedUpdatesWithAct();

        // When the admin selects the invitee and personal details update
        await selectMember(INVITEE_EMAIL);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[INVITEE_ACCOUNT_ID]: {accountID: INVITEE_ACCOUNT_ID, login: INVITEE_EMAIL, displayName: 'Updated name'}});
        });

        // Then tentative invitees survive without changing either shared draft
        expect(getSelectedMemberEmails()).toEqual([ADMIN_EMAIL, INVITEE_EMAIL]);
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toBeUndefined();

        // When Save opens invitations, then the admin leaves the picker for that screen
        await pressSave();
        expect(Navigation.navigate).toHaveBeenCalled();
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
        const stagedWorkflow = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(stagedWorkflow?.pendingInviteMembers?.map((member) => member.email)).toEqual([ADMIN_EMAIL, INVITEE_EMAIL]);
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`)).resolves.toEqual({[INVITEE_EMAIL]: INVITEE_ACCOUNT_ID});

        // When leaving invitation confirmation discards its candidate selection
        await act(async () => setApprovalWorkflowPendingInviteMembers(null));
        await waitForBatchedUpdatesWithAct();

        // Then the parent remains unchanged and the picker still has the tentative selection
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
        expect(getSelectedMemberEmails()).toEqual([ADMIN_EMAIL, INVITEE_EMAIL]);
        page.unmount();
        await waitForBatchedUpdatesWithAct();
        expect(await getWorkflowMemberEmails()).toEqual([ADMIN_EMAIL]);
    });
});
