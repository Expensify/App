import {act, renderHook} from '@testing-library/react-native';

import useConfirmationDiscardGuard from '@pages/iou/request/step/IOURequestStepConfirmation/useConfirmationDiscardGuard';

let mockGetHasUnsavedChanges: () => boolean = () => false;
const mockSuppressDiscardPrompt = jest.fn();

jest.mock('@hooks/useDiscardChangesConfirmation', () => ({
    __esModule: true,
    default: ({getHasUnsavedChanges}: {getHasUnsavedChanges: () => boolean}) => {
        mockGetHasUnsavedChanges = getHasUnsavedChanges;
        return {suppressDiscardPrompt: mockSuppressDiscardPrompt};
    },
}));

type GuardParams = Parameters<typeof useConfirmationDiscardGuard>[0];

const untouchedFlowStart: GuardParams = {shouldConfirmDiscardingChanges: true, isAmountSet: false, isSubmitting: false};

describe('useConfirmationDiscardGuard', () => {
    it('does not ask before leaving an untouched form', () => {
        // Given the form that opens the flow, before the user entered anything
        renderHook(() => useConfirmationDiscardGuard(untouchedFlowStart));

        // When the user leaves it
        const hasUnsavedChanges = mockGetHasUnsavedChanges();

        // Then there is nothing to discard, so the form closes without asking
        expect(hasUnsavedChanges).toBe(false);
    });

    it('asks before leaving a form where the user typed an amount', () => {
        // Given the form that opens the flow, where the user typed an amount into the draft
        renderHook(() => useConfirmationDiscardGuard({...untouchedFlowStart, isAmountSet: true}));

        // When the user leaves it
        const hasUnsavedChanges = mockGetHasUnsavedChanges();

        // Then leaving would throw the amount away, so the form asks first
        expect(hasUnsavedChanges).toBe(true);
    });

    it('asks before leaving when the amount field holds input the draft does not keep', () => {
        // Given the form that opens the flow with no amount in the draft
        const {result} = renderHook(() => useConfirmationDiscardGuard(untouchedFlowStart));

        // When the amount field reports input of its own, such as a minus sign typed without digits
        act(() => result.current.setHasUnsavedAmountInput(true));

        // Then leaving would throw that input away, so the form asks first
        expect(mockGetHasUnsavedChanges()).toBe(true);
    });

    it('does not ask while the expense is being submitted', () => {
        // Given the form that opens the flow, with an amount entered and the expense being submitted
        renderHook(() => useConfirmationDiscardGuard({...untouchedFlowStart, isAmountSet: true, isSubmitting: true}));

        // When the submit closes the form
        const hasUnsavedChanges = mockGetHasUnsavedChanges();

        // Then the form leaves without asking, since the entered amount is being saved
        expect(hasUnsavedChanges).toBe(false);
    });

    it('does not ask on a form that a later step shows', () => {
        // Given a confirmation reached from an earlier step, with an amount entered
        renderHook(() => useConfirmationDiscardGuard({...untouchedFlowStart, shouldConfirmDiscardingChanges: false, isAmountSet: true}));

        // When the user goes back from it
        const hasUnsavedChanges = mockGetHasUnsavedChanges();

        // Then the draft stays for the earlier step, so there is nothing to discard
        expect(hasUnsavedChanges).toBe(false);
    });
});
