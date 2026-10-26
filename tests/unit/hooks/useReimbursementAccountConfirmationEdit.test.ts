import {act, renderHook} from '@testing-library/react-native';

import useReimbursementAccountConfirmationEdit from '@hooks/useReimbursementAccountConfirmationEdit';

import {cancelReimbursementAccountEdit, finishReimbursementAccountEdit, startReimbursementAccountEdit} from '@userActions/ReimbursementAccount';

import type {ReimbursementAccountForm} from '@src/types/form';

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

    it.each([
        {
            description: 'stores the existing draft before opening an edit page',
            isEditing: false,
            turnOnEditMode: undefined,
            shouldStartEdit: true,
            shouldFinishEdit: false,
        },
        {
            description: 'finishes the current edit when moving without edit mode',
            isEditing: true,
            turnOnEditMode: false,
            shouldStartEdit: false,
            shouldFinishEdit: true,
        },
        {
            description: 'does not create edit state during normal forward navigation',
            isEditing: false,
            turnOnEditMode: false,
            shouldStartEdit: false,
            shouldFinishEdit: false,
        },
    ])('$description', ({isEditing, turnOnEditMode, shouldStartEdit, shouldFinishEdit}) => {
        const reimbursementAccountDraft = createMock<ReimbursementAccountForm>({companyName: 'Original company'});
        const moveTo = jest.fn();
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing,
                reimbursementAccountDraft,
                nextPage: jest.fn(),
                moveTo,
            }),
        );

        act(() => result.current.moveToEditPage(2, turnOnEditMode));

        if (shouldStartEdit) {
            expect(mockStartReimbursementAccountEdit).toHaveBeenCalledWith(reimbursementAccountDraft);
        } else {
            expect(mockStartReimbursementAccountEdit).not.toHaveBeenCalled();
        }
        expect(mockFinishReimbursementAccountEdit).toHaveBeenCalledTimes(shouldFinishEdit ? 1 : 0);
        expect(moveTo).toHaveBeenCalledWith(2, turnOnEditMode);
    });

    it('restores the saved snapshot when an edit is canceled', () => {
        const editDraftSnapshot = {companyName: 'Original company'};
        const {result} = renderHook(() =>
            useReimbursementAccountConfirmationEdit({
                isEditing: true,
                reimbursementAccountDraft: createMock<ReimbursementAccountForm>({companyName: 'Unconfirmed company', editDraftSnapshot}),
                nextPage: jest.fn(),
                moveTo: jest.fn(),
            }),
        );

        act(() => result.current.cancelEdit());

        expect(mockCancelReimbursementAccountEdit).toHaveBeenCalledWith(editDraftSnapshot);
    });
});
