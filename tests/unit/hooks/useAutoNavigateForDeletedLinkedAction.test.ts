import {renderHook} from '@testing-library/react-native';

import useAutoNavigateForDeletedLinkedAction from '@pages/inbox/hooks/useAutoNavigateForDeletedLinkedAction';

describe('useAutoNavigateForDeletedLinkedAction', () => {
    let navigateToEndOfReport: jest.Mock;

    beforeEach(() => {
        navigateToEndOfReport = jest.fn();
    });

    describe('initial render', () => {
        it('should not call navigateToEndOfReport when the linked action is available on initial render', () => {
            // Given the linked action is available
            renderHook(() => useAutoNavigateForDeletedLinkedAction(false, navigateToEndOfReport));

            // Then no navigation occurs
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should call navigateToEndOfReport when the linked action is unavailable on initial render', () => {
            // Given a deleted linked action is detected immediately (e.g. deep link to deleted action)
            renderHook(() => useAutoNavigateForDeletedLinkedAction(true, navigateToEndOfReport));

            // Then auto-navigates to end of report
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('transitions', () => {
        it('should call navigateToEndOfReport when isLinkedActionUnavailable transitions from false to true', () => {
            // Given initially no deleted linked action
            const {rerender} = renderHook(({isLinkedActionUnavailable}) => useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable, navigateToEndOfReport), {
                initialProps: {isLinkedActionUnavailable: false},
            });
            expect(navigateToEndOfReport).not.toHaveBeenCalled();

            // When the linked action becomes unavailable
            rerender({isLinkedActionUnavailable: true});

            // Then auto-navigates to end of report
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });

        it('should not call navigateToEndOfReport when isLinkedActionUnavailable transitions from true to false', () => {
            // Given a deleted linked action was detected
            const {rerender} = renderHook(({isLinkedActionUnavailable}) => useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable, navigateToEndOfReport), {
                initialProps: {isLinkedActionUnavailable: true},
            });
            // Clear the initial call
            navigateToEndOfReport.mockClear();

            // When the condition resolves (e.g. report loaded with the linked action visible)
            rerender({isLinkedActionUnavailable: false});

            // Then no additional navigation
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should call navigateToEndOfReport only once when isLinkedActionUnavailable stays true across rerenders', () => {
            // Given a deleted linked action detected
            const {rerender} = renderHook(({isLinkedActionUnavailable}) => useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable, navigateToEndOfReport), {
                initialProps: {isLinkedActionUnavailable: true},
            });
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);

            // When component rerenders with same values (e.g. parent rerenders)
            rerender({isLinkedActionUnavailable: true});
            rerender({isLinkedActionUnavailable: true});

            // Then no additional navigations - effect only fires on dependency change
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('dependency behavior', () => {
        it('should call navigateToEndOfReport on each false-to-true transition of isLinkedActionUnavailable', () => {
            // Given initially no deleted linked action
            const {rerender} = renderHook(({isLinkedActionUnavailable}) => useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable, navigateToEndOfReport), {
                initialProps: {isLinkedActionUnavailable: false},
            });
            expect(navigateToEndOfReport).not.toHaveBeenCalled();

            // First transition: linked action not found
            rerender({isLinkedActionUnavailable: true});
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);

            // Condition resolves
            rerender({isLinkedActionUnavailable: false});

            // Second transition: another linked action not found
            rerender({isLinkedActionUnavailable: true});
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(2);
        });
    });
});
