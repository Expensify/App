import {act, renderHook} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import useOnyx from '@hooks/useOnyx';
import useSignOut from '@hooks/useSignOut';

import {disconnect} from '@libs/actions/Delegate';
import {stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import {getSaveablePendingReceiptRequests, saveReceiptsToGallery} from '@libs/savePendingReceiptsToGallery';

import {signOutAndRedirectToSignIn} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

const mockShowConfirmModal = jest.fn();
const mockTranslate = jest.fn((key: string) => key);

let mockIsOffline = false;

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: mockTranslate}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    signOutAndRedirectToSignIn: jest.fn(),
}));

jest.mock('@libs/actions/Delegate', () => ({
    disconnect: jest.fn(),
}));

jest.mock('@libs/savePendingReceiptsToGallery', () => ({
    getSaveablePendingReceiptRequests: jest.fn(() => []),
    saveReceiptsToGallery: jest.fn(() => Promise.resolve({savedCount: 0, failedCount: 0, permissionDenied: false})),
}));

jest.mock('@libs/GPSDraftDetailsUtils', () => ({
    getGpsPoints: jest.fn(() => []),
    stopGpsTrip: jest.fn(() => Promise.resolve()),
}));

jest.mock('@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications', () => ({
    stopGpsTripNotification: jest.fn(),
}));

jest.mock('expo-location', () => ({
    Accuracy: {Highest: 6},
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@pages/iou/request/step/IOURequestStepDistanceGPS/const', () => ({
    BACKGROUND_LOCATION_TRACKING_TASK_NAME: 'background-location-tracking',
}));

const mockUseOnyx = jest.mocked(useOnyx);
const mockSignOutAndRedirectToSignIn = jest.mocked(signOutAndRedirectToSignIn);
const mockDisconnect = jest.mocked(disconnect);
const mockGetSaveablePendingReceiptRequests = jest.mocked(getSaveablePendingReceiptRequests);
const mockSaveReceiptsToGallery = jest.mocked(saveReceiptsToGallery);
const mockStopGpsTrip = jest.mocked(stopGpsTrip);

type MockOnyxState = {
    isTrackingGPS?: boolean;
    isActingAsDelegate?: boolean;
    stashedCredentials?: Record<string, unknown>;
    stashedSession?: {email?: string};
    gpsDraftDetails?: Record<string, unknown>;
};

const loadedOnyxMetadata = {status: 'loaded'} as const;

function mockOnyxState({
    isTrackingGPS = false,
    isActingAsDelegate = false,
    stashedCredentials = {},
    stashedSession = {email: 'copilot@expensify.com'},
    gpsDraftDetails = {},
}: MockOnyxState = {}) {
    mockUseOnyx.mockImplementation((key, options) => {
        if (key === ONYXKEYS.GPS_DRAFT_DETAILS) {
            if (options?.selector === isTrackingSelector) {
                return [isTrackingGPS, loadedOnyxMetadata];
            }
            return [gpsDraftDetails, loadedOnyxMetadata];
        }
        if (key === ONYXKEYS.ACCOUNT) {
            const account = isActingAsDelegate ? {delegatedAccess: {delegate: 'delegate@expensify.com'}} : {};
            if (options?.selector === isActingAsDelegateSelector) {
                return [isActingAsDelegateSelector(account), loadedOnyxMetadata];
            }
            return [account, loadedOnyxMetadata];
        }
        if (key === ONYXKEYS.STASHED_CREDENTIALS) {
            return [stashedCredentials, loadedOnyxMetadata];
        }
        if (key === ONYXKEYS.STASHED_SESSION) {
            return [stashedSession, loadedOnyxMetadata];
        }
        return [undefined, loadedOnyxMetadata];
    });
}

describe('useSignOut', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockOnyxState();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
    });

    it('should sign out immediately when online with no GPS tracking or pending receipts', async () => {
        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.signOut();
        });

        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should skip duplicate generic confirm when hasConfirmedSignOut is true but still sign out', async () => {
        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.signOut({hasConfirmedSignOut: true});
        });

        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should show merged save-and-sign-out confirm when offline with pending receipts', async () => {
        mockIsOffline = true;
        mockGetSaveablePendingReceiptRequests.mockReturnValue([{localPath: 'file:///receipt.jpg', filename: 'receipt.jpg', type: 'image/jpeg'}]);

        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.signOut();
        });

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'initialSettingsPage.saveReceiptsAndSignOutConfirmation.title',
            }),
        );
        expect(mockSaveReceiptsToGallery).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
    });

    it('should call signOutImmediately without showing confirm modals', () => {
        const {result} = renderHook(() => useSignOut());

        act(() => {
            result.current.signOutImmediately();
        });

        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should disconnect instead of signing out when leaving a delegated account', async () => {
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.leaveDelegateAccount();
        });

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: 'delegate.leaveAccountConfirmationText',
                confirmText: 'delegate.leaveAccount',
            }),
        );
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should show GPS switch-account warning before disconnecting from a delegated account', async () => {
        mockOnyxState({isActingAsDelegate: true, isTrackingGPS: true});

        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.leaveDelegateAccount({hasConfirmedLeave: true});
        });

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'gps.switchAccountWarningTripInProgress.title',
            }),
        );
        expect(mockStopGpsTrip).toHaveBeenCalledTimes(1);
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should block leaving a delegated account while offline', async () => {
        mockIsOffline = true;
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        await act(async () => {
            await result.current.leaveDelegateAccount({hasConfirmedLeave: true});
        });

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'common.youAppearToBeOffline',
            }),
        );
        expect(mockDisconnect).not.toHaveBeenCalled();
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should expose isActingAsDelegate from account state', () => {
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        expect(result.current.isActingAsDelegate).toBe(true);
    });
});
