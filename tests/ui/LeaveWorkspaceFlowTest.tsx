import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import LeaveWorkspaceFlow from '@components/Tables/WorkspaceListTable/LeaveWorkspaceFlow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockLeaveWorkspace = jest.fn();
const mockShowConfirmModal = jest.fn();
const mockUseCurrentUserPersonalDetails = jest.fn();

jest.mock('@hooks/useCurrentUserPersonalDetails', () => (): unknown => mockUseCurrentUserPersonalDetails());

jest.mock('@libs/actions/Policy/Policy', () => ({
    leaveWorkspace: (...args: unknown[]) => {
        mockLeaveWorkspace(...args);
    },
}));

jest.mock('@hooks/useConfirmModal', () =>
    jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: jest.fn(),
    })),
);

jest.mock('@libs/actions/Modal', () => ({
    close: jest.fn().mockImplementation((callback?: () => void) => callback?.()),
}));

const POLICY_ID = 'test-policy-id';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 1;

const renderAction = (onDismiss = jest.fn()) =>
    render(
        <LocaleContextProvider>
            <LeaveWorkspaceFlow
                policyID={POLICY_ID}
                onDismiss={onDismiss}
            />
        </LocaleContextProvider>,
    );

describe('LeaveWorkspaceFlow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockLeaveWorkspace.mockReset();
        mockShowConfirmModal.mockReset();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: USER_ACCOUNT_ID, login: USER_EMAIL});
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('renders null', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: 'Test', role: CONST.POLICY.ROLE.ADMIN});
        const {toJSON} = renderAction();
        await waitForBatchedUpdatesWithAct();
        expect(toJSON()).toBeNull();
    });

    it('shows a single-button success modal when the user is the reimbursement contact', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.ADMIN,
            achAccount: {reimburser: USER_EMAIL},
        });
        renderAction();
        await waitForBatchedUpdatesWithAct();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({success: true, shouldShowCancelButton: false}));
    });

    it('calls onDismiss after the reimburser modal resolves', async () => {
        const onDismiss = jest.fn();
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.ADMIN,
            achAccount: {reimburser: USER_EMAIL},
        });
        renderAction(onDismiss);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(onDismiss).toHaveBeenCalled());
    });

    it('shows a danger two-button modal when the user is not the reimbursement contact', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        renderAction();
        await waitForBatchedUpdatesWithAct();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({danger: true}));
    });

    it('calls leaveWorkspace and onDismiss on confirm when user is not the reimbursement contact', async () => {
        const onDismiss = jest.fn();
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        renderAction(onDismiss);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(mockLeaveWorkspace).toHaveBeenCalled();
            expect(onDismiss).toHaveBeenCalled();
        });
    });

    it('does not call leaveWorkspace but still calls onDismiss on cancel', async () => {
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CLOSE});
        const onDismiss = jest.fn();
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        renderAction(onDismiss);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(onDismiss).toHaveBeenCalled());
        expect(mockLeaveWorkspace).not.toHaveBeenCalled();
    });

    it('shows the modal for a regular member when no special role data is present', async () => {
        // Regular member (no achAccount, technicalContact, approver, or elevated role) gets the default danger modal
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test',
            role: CONST.POLICY.ROLE.USER,
        });
        renderAction();
        await waitForBatchedUpdatesWithAct();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({danger: true}));
    });
});
