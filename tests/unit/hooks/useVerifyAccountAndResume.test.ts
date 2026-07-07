import {act, renderHook, waitFor} from '@testing-library/react-native';

import useVerifyAccountAndResume from '@hooks/useVerifyAccountAndResume';

import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type ResumePayload = {
    paymentID: string;
};

const mockVerifyAccountRoute = 'r/123/verify-account?source=pay';
const mockVerifyAccountPath = 'r/123/verify-account';
const mockCancelTransition = jest.fn();
const mockNavigationStateListeners = new Set<() => void>();
let mockPendingTransitionCallbacks: Array<() => void> = [];

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: jest.fn(() => 'r/123/verify-account?source=pay'),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockNavigationModule = {
        navigate: jest.fn(),
        runAfterUpcomingTransition: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(),
    };
    return {
        __esModule: true,
        default: mockNavigationModule,
        ...mockNavigationModule,
    };
});

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        addListener: jest.fn(),
    },
}));

const mockedNavigation = jest.mocked(Navigation);
const mockedNavigationRef = jest.mocked(navigationRef);

function emitNavigationStateChange() {
    for (const listener of mockNavigationStateListeners) {
        listener();
    }
}

async function setIsUserValidated(validated: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated});
    });
    await waitForBatchedUpdatesWithAct();
}

async function clearOnyx() {
    await act(async () => {
        await Onyx.clear();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('useVerifyAccountAndResume', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await clearOnyx();

        jest.clearAllMocks();
        mockNavigationStateListeners.clear();
        mockPendingTransitionCallbacks = [];
        mockedNavigation.getActiveRouteWithoutParams.mockReturnValue(mockVerifyAccountPath);
        mockedNavigation.runAfterUpcomingTransition.mockImplementation((callback: () => void) => {
            mockPendingTransitionCallbacks.push(callback);
            return {cancel: mockCancelTransition};
        });
        mockedNavigationRef.addListener.mockImplementation((_eventName: string, listener: () => void) => {
            mockNavigationStateListeners.add(listener);
            return () => {
                mockNavigationStateListeners.delete(listener);
            };
        });

        await setIsUserValidated(false);
    });

    afterEach(async () => {
        await clearOnyx();
    });

    it('navigates to verify account and exposes validation state', async () => {
        const onResume = jest.fn();
        const {result} = renderHook(() => useVerifyAccountAndResume<ResumePayload>(onResume));

        await waitFor(() => {
            expect(result.current.isUserValidated).toBe(false);
        });

        act(() => {
            result.current.verifyAccountAndResume({paymentID: 'payment-1'});
        });

        expect(mockedNavigation.navigate).toHaveBeenCalledWith(mockVerifyAccountRoute);
        expect(onResume).not.toHaveBeenCalled();
    });

    it('resumes the stored payload after validation on the same verify account route', async () => {
        const initialOnResume = jest.fn();
        const latestOnResume = jest.fn();
        const {result, rerender} = renderHook(({onResume}: {onResume: (payload: ResumePayload) => void}) => useVerifyAccountAndResume(onResume), {
            initialProps: {onResume: initialOnResume},
        });

        act(() => {
            result.current.verifyAccountAndResume({paymentID: 'payment-1'});
        });
        rerender({onResume: latestOnResume});

        await setIsUserValidated(true);

        await waitFor(() => {
            expect(mockedNavigation.runAfterUpcomingTransition).toHaveBeenCalledTimes(1);
        });
        expect(latestOnResume).not.toHaveBeenCalled();

        act(() => {
            mockPendingTransitionCallbacks.at(0)?.();
        });

        expect(initialOnResume).not.toHaveBeenCalled();
        expect(latestOnResume).toHaveBeenCalledWith({paymentID: 'payment-1'});
    });

    it('drops the pending resume when the user leaves the verify account route before validation', async () => {
        const onResume = jest.fn();
        const {result} = renderHook(() => useVerifyAccountAndResume<ResumePayload>(onResume));

        act(() => {
            result.current.verifyAccountAndResume({paymentID: 'payment-1'});
        });

        await waitFor(() => {
            expect(mockNavigationStateListeners.size).toBe(1);
        });

        mockedNavigation.getActiveRouteWithoutParams.mockReturnValue('r/123');
        act(() => {
            emitNavigationStateChange();
        });

        mockedNavigation.getActiveRouteWithoutParams.mockReturnValue(mockVerifyAccountPath);
        await setIsUserValidated(true);

        expect(mockedNavigation.runAfterUpcomingTransition).not.toHaveBeenCalled();
        expect(onResume).not.toHaveBeenCalled();
    });
});
