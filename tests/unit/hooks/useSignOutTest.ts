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
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';

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
const mockDelegateDisconnect = jest.mocked(disconnect);
const mockGetSaveablePendingReceiptRequests = jest.mocked(getSaveablePendingReceiptRequests);
const mockSaveReceiptsToGallery = jest.mocked(saveReceiptsToGallery);
const mockStopGpsTrip = jest.mocked(stopGpsTrip);

type MockOnyxState = {
    isTrackingGPS?: boolean;
    isActingAsDelegate?: boolean;
    stashedCredentials?: Record<string, unknown>;
    stashedSession?: {email?: string};
};

const loadedOnyxMetadata = {status: 'loaded'} as const;

const mockGpsDraftDetails: GpsDraftDetails = {
    gpsPoints: [[{lat: 1, long: 2}]],
    distanceInMeters: 0,
    isTracking: true,
    reportID: '1',
    unit: 'mi',
};

function mockOnyxState({isTrackingGPS = false, isActingAsDelegate = false, stashedCredentials = {}, stashedSession = {email: 'copilot@expensify.com'}}: MockOnyxState = {}) {
    mockUseOnyx.mockImplementation((key, options) => {
        if (key === ONYXKEYS.GPS_DRAFT_DETAILS) {
            if (options?.selector === isTrackingSelector) {
                return [isTrackingGPS, loadedOnyxMetadata];
            }
            return [undefined, loadedOnyxMetadata];
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
        // Given the user is online with no active GPS trip and no pending receipts
        const {result} = renderHook(() => useSignOut());

        // When they sign out from settings
        await act(async () => {
            await result.current.signOut();
        });

        // Then sign-out proceeds without an extra confirm modal
        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should show generic confirm when shouldAlwaysConfirm is true before signing out', async () => {
        // Given the require-2FA overlay asks the hook to always confirm sign-out
        const {result} = renderHook(() => useSignOut());

        // When signOut is called with shouldAlwaysConfirm
        await act(async () => {
            await result.current.signOut({shouldAlwaysConfirm: true});
        });

        // Then the generic sign-out confirm appears before redirecting
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: 'initialSettingsPage.signOutConfirmationText',
                confirmText: 'initialSettingsPage.signOut',
            }),
        );
        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
    });

    it('should show merged save-and-sign-out confirm when offline with pending receipts', async () => {
        // Given the user is offline and has pending receipts to save
        mockIsOffline = true;
        mockGetSaveablePendingReceiptRequests.mockReturnValue([{localPath: 'file:///receipt.jpg', filename: 'receipt.jpg', type: 'image/jpeg'}]);

        const {result} = renderHook(() => useSignOut());

        // When they attempt to sign out
        await act(async () => {
            await result.current.signOut();
        });

        // Then the merged save-and-sign-out modal runs before redirecting
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'initialSettingsPage.saveReceiptsAndSignOutConfirmation.title',
            }),
        );
        expect(mockSaveReceiptsToGallery).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
    });

    it('should call signOutImmediately without showing confirm modals', () => {
        // Given the settings page uses the immediate sign-out escape hatch
        const {result} = renderHook(() => useSignOut());

        // When signOutImmediately is invoked
        act(() => {
            result.current.signOutImmediately();
        });

        // Then redirect happens with no confirm modals
        expect(mockSignOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should disconnect instead of signing out when leaving a delegated account', async () => {
        // Given the user is acting as a copilot delegate while online
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        // When they choose to leave the delegated account
        await act(async () => {
            await result.current.leaveDelegateAccount();
        });

        // Then the leave confirm appears and disconnect runs instead of sign-out
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: 'delegate.leaveAccountConfirmationText',
                confirmText: 'delegate.leaveAccount',
            }),
        );
        expect(mockDelegateDisconnect).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should show GPS switch-account warning before disconnecting from a delegated account', async () => {
        // Given a copilot is leaving while a GPS trip is in progress
        mockOnyxState({isActingAsDelegate: true, isTrackingGPS: true});

        const {result} = renderHook(() => useSignOut());

        // When they confirm leaving the delegated account with GPS draft details from the overlay ref
        await act(async () => {
            await result.current.leaveDelegateAccount({gpsDraftDetails: mockGpsDraftDetails});
        });

        // Then the GPS switch-account warning appears and the trip is stopped before disconnect
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'gps.switchAccountWarningTripInProgress.title',
            }),
        );
        expect(mockStopGpsTrip).toHaveBeenCalledTimes(1);
        expect(mockDelegateDisconnect).toHaveBeenCalledTimes(1);
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should block leaving a delegated account while offline', async () => {
        // Given a copilot is offline and tries to leave the delegated account
        mockIsOffline = true;
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        // When leaveDelegateAccount is invoked
        await act(async () => {
            await result.current.leaveDelegateAccount();
        });

        // Then the offline modal appears first and disconnect never runs
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'common.youAppearToBeOffline',
            }),
        );
        expect(mockDelegateDisconnect).not.toHaveBeenCalled();
        expect(mockSignOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });

    it('should expose isActingAsDelegate from account state', () => {
        // Given the account is in delegate mode
        mockOnyxState({isActingAsDelegate: true});

        const {result} = renderHook(() => useSignOut());

        // When the hook is rendered
        // Then callers can branch on isActingAsDelegate
        expect(result.current.isActingAsDelegate).toBe(true);
    });
});
