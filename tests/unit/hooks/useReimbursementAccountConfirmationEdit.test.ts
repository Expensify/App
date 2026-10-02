import {act, renderHook} from '@testing-library/react-native';

import useReimbursementAccountConfirmationEdit from '@hooks/useReimbursementAccountConfirmationEdit';

import {cancelReimbursementAccountEdit, finishReimbursementAccountEdit, startReimbursementAccountEdit} from '@userActions/ReimbursementAccount';

import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import createMock from '../../utils/createMock';

jest.mock('@userActions/ReimbursementAccount', () => ({
    cancelReimbursementAccountEdit: jest.fn(),
    finishReimbursementAccountEdit: jest.fn(),
    startReimbursementAccountEdit: jest.fn(),
}));

const mockCancelReimbursementAccountEdit = jest.mocked(cancelReimbursementAccountEdit);
const mockFinishReimbursementAccountEdit = jest.mocked(finishReimbursementAccountEdit);
const mockStartReimbursementAccountEdit = jest.mocked(startReimbursementAccountEdit);

describe('useReimbursementAccountConfirmationEdit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('stores the existing draft before opening an edit page', () => {
        // Given a confirmation page with persisted form values
        const reimbursementAccountDraft = createMock<ReimbursementAccountForm>({companyName: 'Original company'});
        const moveTo = jest.fn();
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing: false,
                reimbursementAccountDraft,
                nextPage: jest.fn(),
                moveTo,
            }),
        );

        // When a confirmation row opens its edit page
        act(() => result.current.moveToEditPage(2));

        // Then the original values are snapshotted before edit navigation
        expect(mockStartReimbursementAccountEdit).toHaveBeenCalledWith(reimbursementAccountDraft);
        expect(mockFinishReimbursementAccountEdit).not.toHaveBeenCalled();
        expect(moveTo).toHaveBeenCalledWith(2, undefined);
    });

    it('finishes the current edit when moving without edit mode', () => {
        // Given an edit page that skips an intermediate page when it is submitted
        const moveTo = jest.fn();
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing: true,
                reimbursementAccountDraft: createMock<ReimbursementAccountForm>({[INPUT_IDS.SIGNER_INFO_STEP.SIGNER_COUNTRY]: 'GB'}),
                nextPage: jest.fn(),
                moveTo,
            }),
        );

        // When the confirmed edit returns to a non-edit destination
        act(() => result.current.moveToEditPage(4, false));

        // Then the existing snapshot is cleared instead of being overwritten with edited values
        expect(mockFinishReimbursementAccountEdit).toHaveBeenCalledTimes(1);
        expect(mockStartReimbursementAccountEdit).not.toHaveBeenCalled();
        expect(moveTo).toHaveBeenCalledWith(4, false);
    });

    it('does not create edit state during normal forward navigation', () => {
        // Given a non-edit page that skips an intermediate page
        const moveTo = jest.fn();
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing: false,
                reimbursementAccountDraft: createMock<ReimbursementAccountForm>({[INPUT_IDS.SIGNER_INFO_STEP.SIGNER_COUNTRY]: 'GB'}),
                nextPage: jest.fn(),
                moveTo,
            }),
        );

        // When normal navigation explicitly keeps edit mode disabled
        act(() => result.current.moveToEditPage(4, false));

        // Then no edit snapshot is started or finished
        expect(mockStartReimbursementAccountEdit).not.toHaveBeenCalled();
        expect(mockFinishReimbursementAccountEdit).not.toHaveBeenCalled();
        expect(moveTo).toHaveBeenCalledWith(4, false);
    });

    it('restores the saved snapshot when an edit is canceled', () => {
        // Given an edit page with the original draft snapshot
        const editDraftSnapshot = {companyName: 'Original company'};
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing: true,
                reimbursementAccountDraft: createMock<ReimbursementAccountForm>({companyName: 'Unconfirmed company', editDraftSnapshot}),
                nextPage: jest.fn(),
                moveTo: jest.fn(),
            }),
        );

        // When Back cancels the edit
        act(() => result.current.cancelEdit());

        // Then the pre-edit snapshot is restored
        expect(mockCancelReimbursementAccountEdit).toHaveBeenCalledWith(editDraftSnapshot);
    });
});
