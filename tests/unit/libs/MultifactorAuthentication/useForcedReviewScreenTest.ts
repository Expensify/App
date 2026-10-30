import {act, renderHook} from '@testing-library/react-native';

import useForcedReviewScreen from '@pages/MultifactorAuthentication/useForcedReviewScreen';

const mockCloseRHPFlow = jest.fn();
let mockIsOffline = false;
let mockBeforeRemove: ((event: {preventDefault: () => void}) => void) | undefined;

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: () => {
        mockCloseRHPFlow();
    },
}));

jest.mock('@hooks/useNetworkWithOfflineStatus', () => () => ({isOffline: mockIsOffline}));

jest.mock('@hooks/useBeforeRemove', () => (callback: (event: {preventDefault: () => void}) => void) => {
    mockBeforeRemove = callback;
});

const TRANSACTION_ID = '9990001';

type Params = Parameters<typeof useForcedReviewScreen>[0];

function renderScreen(overrides: Partial<Params> = {}) {
    const onConfirmBackOut = jest.fn();
    const initialProps: Params = {
        transactionID: TRANSACTION_ID,
        isTransactionPendingReview: true,
        isSubmitting: false,
        isShowingOutcome: false,
        onConfirmBackOut,
        addBreadcrumb: () => {},
        ...overrides,
    };
    const hook = renderHook((props: Params) => useForcedReviewScreen(props), {initialProps});
    return {...hook, onConfirmBackOut, initialProps};
}

function leaveScreen() {
    const preventDefault = jest.fn();
    act(() => mockBeforeRemove?.({preventDefault}));
    return preventDefault;
}

describe('useForcedReviewScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockBeforeRemove = undefined;
    });

    it('turns leaving the screen into the back-out confirmation', () => {
        // Given an open review screen
        const {result} = renderScreen();

        // When the user tries to leave it, e.g. with the header back arrow or the browser Back button
        const preventDefault = leaveScreen();

        // Then the navigation is stopped and the confirmation is shown, so the review can't be skipped by accident
        expect(preventDefault).toHaveBeenCalled();
        expect(result.current.isConfirmModalVisible).toBe(true);
    });

    it('closes right away without the confirmation while offline', () => {
        // Given the device is offline, where the review can't be answered anyway
        mockIsOffline = true;
        const {result} = renderScreen();

        // When the user tries to leave the screen
        leaveScreen();

        // Then the screen closes without asking, since nothing can be sent to the server
        expect(result.current.isConfirmModalVisible).toBe(false);
        expect(mockCloseRHPFlow).toHaveBeenCalledTimes(1);
    });

    it('lets the screen go after the user confirms backing out', () => {
        // Given the user opened the back-out confirmation
        const {result, onConfirmBackOut} = renderScreen();
        leaveScreen();

        // When they confirm it
        act(() => result.current.confirmBackOut());

        // Then the screen's own back-out handler runs and leaving is no longer intercepted
        expect(onConfirmBackOut).toHaveBeenCalledTimes(1);
        expect(result.current.isConfirmModalVisible).toBe(false);
        expect(leaveScreen()).not.toHaveBeenCalled();
    });

    it('closes the screen when the review disappears from the queue', () => {
        // Given an open review screen
        const {rerender, initialProps} = renderScreen();

        // When the review is answered on another device and removed from the queue
        rerender({...initialProps, isTransactionPendingReview: false});

        // Then the screen closes by itself
        expect(mockCloseRHPFlow).toHaveBeenCalledTimes(1);
    });

    it('stays open while its own request is in flight or an outcome is shown', () => {
        // Given the review was answered on this screen, so the server removes it from the queue
        const {rerender, initialProps} = renderScreen();

        // When the queue entry disappears while the request is still running, and later while the outcome is shown
        rerender({...initialProps, isTransactionPendingReview: false, isSubmitting: true});
        rerender({...initialProps, isTransactionPendingReview: false, isShowingOutcome: true});

        // Then the screen isn't closed, so the user still sees the result of their answer
        expect(mockCloseRHPFlow).not.toHaveBeenCalled();
    });
});
