import {renderHook} from '@testing-library/react-native';
import useAutoNavigateForDeletedLinkedAction from '@pages/inbox/hooks/useAutoNavigateForDeletedLinkedAction';

describe('useAutoNavigateForDeletedLinkedAction', () => {
    let navigateToEndOfReport: jest.Mock;

    beforeEach(() => {
        navigateToEndOfReport = jest.fn();
    });

    describe('initial render', () => {
        it('should not call navigateToEndOfReport when both conditions are false on initial render', () => {
            // Given both conditions are false
            renderHook(() => useAutoNavigateForDeletedLinkedAction(false, false, navigateToEndOfReport));

            // Then no navigation occurs
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should call navigateToEndOfReport when both conditions are true on initial render', () => {
            // Given a deleted linked action is detected immediately (e.g. deep link to deleted action)
            renderHook(() => useAutoNavigateForDeletedLinkedAction(true, true, navigateToEndOfReport));

            // Then auto-navigates to end of report
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });

        it('should not call navigateToEndOfReport when shouldShowNotFoundLinkedAction is true but shouldShowNotFoundPage is false', () => {
            // Given linked action is not found but not-found page should not be shown (e.g. still loading)
            renderHook(() => useAutoNavigateForDeletedLinkedAction(false, true, navigateToEndOfReport));

            // Then no navigation - page is still loading or in a transitional state
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should not call navigateToEndOfReport when shouldShowNotFoundPage is true but shouldShowNotFoundLinkedAction is false', () => {
            // Given not-found page should be shown but not because of a linked action
            renderHook(() => useAutoNavigateForDeletedLinkedAction(true, false, navigateToEndOfReport));

            // Then no navigation - the not-found page is shown for a different reason (e.g. invalid report path)
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });
    });

    describe('transitions', () => {
        it('should call navigateToEndOfReport when shouldShowNotFoundLinkedAction transitions from false to true', () => {
            // Given initially no deleted linked action
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: false}},
            );
            expect(navigateToEndOfReport).not.toHaveBeenCalled();

            // When linked action becomes not found (and not-found page would show)
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true});

            // Then auto-navigates to end of report
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });

        it('should not call navigateToEndOfReport when shouldShowNotFoundLinkedAction transitions from true to false', () => {
            // Given a deleted linked action was detected
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true}},
            );
            // Clear the initial call
            navigateToEndOfReport.mockClear();

            // When the condition resolves (e.g. report loaded without the linked action issue)
            rerender({shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: false});

            // Then no additional navigation
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should not call navigateToEndOfReport when shouldShowNotFoundLinkedAction transitions to true but shouldShowNotFoundPage stays false', () => {
            // Given initially no deleted linked action
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: false}},
            );

            // When linked action is not found but not-found page should not show (e.g. loading)
            rerender({shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: true});

            // Then no navigation - the guard prevents premature navigation
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should call navigateToEndOfReport only once when shouldShowNotFoundLinkedAction stays true across rerenders', () => {
            // Given a deleted linked action detected
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true}},
            );
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);

            // When component rerenders with same values (e.g. parent rerenders)
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true});
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true});

            // Then no additional navigations - effect only fires on dependency change
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('dependency behavior', () => {
        it('should only react to shouldShowNotFoundLinkedAction changes, not shouldShowNotFoundPage changes', () => {
            // Given both conditions initially false
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: false}},
            );

            // When only shouldShowNotFoundPage changes (e.g. report becomes not found for other reasons)
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: false});

            // Then no navigation - the effect doesn't fire because shouldShowNotFoundLinkedAction didn't change
            expect(navigateToEndOfReport).not.toHaveBeenCalled();
        });

        it('should call navigateToEndOfReport on each false-to-true transition of shouldShowNotFoundLinkedAction', () => {
            // Given initially no deleted linked action
            const {rerender} = renderHook(
                ({shouldShowNotFoundPage, shouldShowNotFoundLinkedAction}) =>
                    useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage, shouldShowNotFoundLinkedAction, navigateToEndOfReport),
                {initialProps: {shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: false}},
            );
            expect(navigateToEndOfReport).not.toHaveBeenCalled();

            // First transition: linked action not found
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true});
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(1);

            // Condition resolves
            rerender({shouldShowNotFoundPage: false, shouldShowNotFoundLinkedAction: false});

            // Second transition: another linked action not found
            rerender({shouldShowNotFoundPage: true, shouldShowNotFoundLinkedAction: true});
            expect(navigateToEndOfReport).toHaveBeenCalledTimes(2);
        });
    });
});
