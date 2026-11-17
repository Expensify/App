import {act, render, waitFor} from '@testing-library/react-native';

import LocationPermissionModal from '@components/LocationPermissionModal';
import AndroidLocationPermissionModal from '@components/LocationPermissionModal/index.android';

import getPlatform from '@libs/getPlatform';
import Visibility from '@libs/Visibility';

import type * as LocationPermissionModule from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

import CONST from '@src/CONST';

import type {PermissionStatus} from 'react-native-permissions';

import React from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockCloseModal, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';

const mockGetLocationPermission = jest.fn<ReturnType<typeof LocationPermissionModule.getLocationPermission>, Parameters<typeof LocationPermissionModule.getLocationPermission>>();
const mockRequestLocationPermission = jest.fn<ReturnType<typeof LocationPermissionModule.requestLocationPermission>, Parameters<typeof LocationPermissionModule.requestLocationPermission>>();
const mockUpdateLastLocationPermissionPrompt = jest.fn();

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@components/Icon/IllustrationLoader', () => ({
    loadIllustration: jest.fn(() => 'ReceiptLocationMarker'),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyAsset: (loadAsset: () => unknown) => ({asset: loadAsset()}),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    mb0: {},
    mb4: {},
    mt2: {},
    textHeadline: {},
    textLabelSupportingEmptyValue: {},
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'web'),
}));

jest.mock('@libs/Visibility', () => ({
    onVisibilityChange: jest.fn(() => jest.fn()),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/LocationPermission', () => ({
    getLocationPermission: (...args: Parameters<typeof LocationPermissionModule.getLocationPermission>) => mockGetLocationPermission(...args),
    requestLocationPermission: (...args: Parameters<typeof LocationPermissionModule.requestLocationPermission>) => mockRequestLocationPermission(...args),
}));

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    updateLastLocationPermissionPrompt: () => {
        mockUpdateLastLocationPermissionPrompt();
    },
}));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
}));

const originalOpenSettings = Linking.openSettings?.bind(Linking);
const mockGetPlatform = jest.mocked(getPlatform);

function setOpenSettings(openSettings: typeof Linking.openSettings | undefined) {
    Object.defineProperty(Linking, 'openSettings', {
        configurable: true,
        value: openSettings,
    });
}

function createDefaultProps() {
    return {
        onDeny: jest.fn(),
        onGrant: jest.fn(),
        resetPermissionFlow: jest.fn(),
        startPermissionFlow: true,
    };
}

function renderLocationPermissionModal(props: ReturnType<typeof createDefaultProps>) {
    return render(
        <LocationPermissionModal
            onDeny={props.onDeny}
            onGrant={props.onGrant}
            resetPermissionFlow={props.resetPermissionFlow}
            startPermissionFlow={props.startPermissionFlow}
        />,
    );
}

function renderAndroidLocationPermissionModal(props: ReturnType<typeof createDefaultProps>) {
    return render(
        <AndroidLocationPermissionModal
            onDeny={props.onDeny}
            onGrant={props.onGrant}
            resetPermissionFlow={props.resetPermissionFlow}
            startPermissionFlow={props.startPermissionFlow}
        />,
    );
}

// Simulates the app coming back to the foreground, which makes the web/iOS prompt re-check the permission.
async function triggerVisibilityChange() {
    const listener = jest.mocked(Visibility.onVisibilityChange).mock.calls.at(-1)?.[0];
    if (!listener) {
        throw new Error('The prompt did not subscribe to visibility changes');
    }
    await act(async () => {
        listener();
    });
}

describe('LocationPermissionModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.GRANTED);
        setOpenSettings(originalOpenSettings);
    });

    afterAll(() => {
        setOpenSettings(originalOpenSettings);
        jest.restoreAllMocks();
    });

    describe('web/iOS (index.tsx)', () => {
        it('Prompt -> Dismiss -> no denial reported', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);

            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps the backdrop, which makes the prompt resolve as closed after the backdrop handler already ran
            await act(async () => {
                getShowConfirmModalOption('onBackdropPress')?.();
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the flow ends with exactly one outcome: a single reset, and neither a grant nor a denial
            expect(props.resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(mockCloseModal).not.toHaveBeenCalled();
        });

        it('Prompt -> Not Now -> denies (user initiated)', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);

            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Not now"
            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the denial is the only outcome, because a reset would make callers drop their loading state before they handle the denial
            expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onDeny).toHaveBeenCalledWith(true);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> Allow -> grants', async () => {
            const props = createDefaultProps();
            // Given the prompt is shown and the OS will grant the permission
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockResolvedValue(RESULTS.GRANTED);

            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Continue" and allows the permission
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the grant is the only outcome
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> Reject -> denies (not user initiated)', async () => {
            const props = createDefaultProps();
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

            // Given the prompt is shown and the OS will reject the permission
            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Continue" and rejects the permission
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the denial is the only outcome
            await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
            expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1);
        });

        it('Prompt -> Confirm -> still Blocked -> denies and starts the prompt window', async () => {
            const props = createDefaultProps();
            // Given the permission is blocked and the platform has no way to open the OS settings
            mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);
            setOpenSettings(undefined);

            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            expect(getShowConfirmModalOption('confirmText')).toBe('common.buttonConfirm');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

            // When the user confirms the blocked prompt
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the denial is the only outcome, because the permission is re-checked instead of the user being redirected
            await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(mockUpdateLastLocationPermissionPrompt).toHaveBeenCalledTimes(1);
            expect(mockRequestLocationPermission).not.toHaveBeenCalled();
        });

        it('Prompt -> Confirm while Blocked with a settings deep link -> opens Settings and only resets', async () => {
            const props = createDefaultProps();
            const openSettings = jest.fn().mockResolvedValue(undefined);

            // Given the permission is blocked and the platform can open the OS settings
            mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);
            setOpenSettings(openSettings);

            renderLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user confirms the blocked prompt
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the user leaves for Settings without a decision, so the flow is only reset and neither a grant nor a denial is reported
            expect(openSettings).toHaveBeenCalledTimes(1);
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
            expect(props.resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(mockRequestLocationPermission).not.toHaveBeenCalled();
        });

        it('Prompt -> granted from Settings while open -> Dismiss -> only grants', async () => {
            const props = createDefaultProps();

            // Given the prompt is open and the user grants the permission from the OS Settings, which the polling picks up when the app comes back
            mockGetLocationPermission.mockResolvedValueOnce(RESULTS.DENIED).mockResolvedValue(RESULTS.GRANTED);
            renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            await triggerVisibilityChange();
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));

            // When the user then dismisses the prompt by tapping the backdrop
            await act(async () => {
                getShowConfirmModalOption('onBackdropPress')?.();
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the grant stays the only outcome, so a caller that clears its state on reset does not undo the grant
            expect(props.onGrant).toHaveBeenCalledTimes(1);
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
        });

        it('Prompt -> granted from Settings while open -> Continue -> closes modal and grants', async () => {
            const props = createDefaultProps();

            // Given the prompt is open and the user grants permission from OS Settings, which polling picks up on visibility change
            mockGetLocationPermission.mockResolvedValueOnce(RESULTS.DENIED).mockResolvedValue(RESULTS.GRANTED);
            renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            await triggerVisibilityChange();
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));

            // When the user taps Continue on the prompt
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the confirm modal is closed to dismiss the loading state
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
            expect(props.onGrant).toHaveBeenCalledTimes(1);
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> polling grant while request is in flight -> invokes onGrant only once', async () => {
            const props = createDefaultProps();
            let resolveRequestPermission: (value: PermissionStatus) => void = () => {};

            // Given the prompt is shown and the OS permission request will be delayed
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveRequestPermission = resolve;
                    }),
            );
            renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps Continue to start requesting permission
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });
            await waitFor(() => expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1));

            // And a polling tick detects the granted permission before the request promise resolves
            mockGetLocationPermission.mockResolvedValue(RESULTS.GRANTED);
            await triggerVisibilityChange();
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));

            // And the in-flight permission request finally resolves with GRANTED
            await act(async () => {
                resolveRequestPermission(RESULTS.GRANTED);
            });

            // Then onGrant is invoked exactly once and neither denial nor reset is called
            expect(props.onGrant).toHaveBeenCalledTimes(1);
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(mockCloseModal).toHaveBeenCalled();
        });

        it('Prompt -> granted from Settings while open -> stops polling immediately', async () => {
            const props = createDefaultProps();

            // Given the prompt is open and the user grants permission from OS Settings
            mockGetLocationPermission.mockResolvedValueOnce(RESULTS.DENIED).mockResolvedValue(RESULTS.GRANTED);
            renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the polling picks up the grant via visibility change
            await triggerVisibilityChange();
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            mockGetLocationPermission.mockClear();

            // And subsequent visibility changes occur
            await triggerVisibilityChange();

            // Then polling does not query permission again because it was stopped upon grant
            expect(mockGetLocationPermission).not.toHaveBeenCalled();
        });

        it('Prompt -> user taps Not now while polling check is in flight -> does not grant on late resolution', async () => {
            const props = createDefaultProps();
            let resolvePermissionCheck: (value: PermissionStatus) => void = () => {};

            // Given the prompt is open and a polling check is in flight waiting for the permission check to resolve
            mockGetLocationPermission
                .mockResolvedValueOnce(RESULTS.DENIED)
                .mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            resolvePermissionCheck = resolve;
                        }),
                )
                .mockResolvedValue(RESULTS.DENIED);

            renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await triggerVisibilityChange();
            await waitFor(() => expect(mockGetLocationPermission).toHaveBeenCalledTimes(2));

            // When the user taps Not now before the check resolves
            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // And the in-flight check resolves with GRANTED after the prompt has closed
            await act(async () => {
                resolvePermissionCheck(RESULTS.GRANTED);
            });

            // Then only denial is reported, preserving the exactly-one-callback invariant
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });

        it('Prompt -> backdrop dismissal with caller resetting startPermissionFlow -> re-opening -> Not Now -> reports denial', async () => {
            // Given the prompt is open and the caller resets startPermissionFlow on resetPermissionFlow
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            let startFlow = true;
            const onDeny = jest.fn();
            const onGrant = jest.fn();
            const resetPermissionFlow = jest.fn(() => {
                startFlow = false;
            });

            const {rerender} = render(
                <LocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps the backdrop, which triggers reset and causes the caller to set startPermissionFlow=false
            await act(async () => {
                getShowConfirmModalOption('onBackdropPress')?.();
            });
            rerender(
                <LocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            expect(mockCloseModal).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // And a new flow starts and the user taps Not now
            startFlow = true;
            rerender(
                <LocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then each flow reports exactly one outcome: a reset for the backdrop, and a user-initiated denial for Not now because the backdrop flag did not leak
            expect(resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(onDeny).toHaveBeenCalledTimes(1);
            expect(onDeny).toHaveBeenCalledWith(true);
            expect(onGrant).not.toHaveBeenCalled();
        });
        it('Prompt -> caller unmounts while the prompt is open -> closes the prompt and reports nothing', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            const {unmount} = renderLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the caller unmounts and the prompt then resolves as closed
            unmount();
            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the prompt is closed and no outcome reaches the unmounted caller
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });
    });

    describe('Android', () => {
        it('Prompt -> Dismiss -> no denial reported', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);

            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps the backdrop, which makes the prompt resolve as closed after the backdrop handler already ran
            await act(async () => {
                getShowConfirmModalOption('onBackdropPress')?.();
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the flow ends with exactly one outcome: a single reset, and neither a grant nor a denial
            expect(props.resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(mockCloseModal).not.toHaveBeenCalled();
        });

        it('Prompt -> Not Now -> denies (user initiated)', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);

            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Not now"
            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the denial is the only outcome
            expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onDeny).toHaveBeenCalledWith(true);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> Allow -> grants', async () => {
            const props = createDefaultProps();
            // Given the prompt is shown and the OS will grant the permission
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockResolvedValue(RESULTS.GRANTED);

            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Continue" and allows the permission
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the grant is the only outcome
            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> Reject -> denies (not user initiated)', async () => {
            const props = createDefaultProps();
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

            // Given the prompt is shown and the OS will reject the permission
            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Continue" and rejects the permission
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the denial is the only outcome
            await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
            expect(props.onDeny).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
            expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
        });

        it('Prompt -> Continue -> becomes Blocked -> re-prompts with Settings copy -> Dismiss -> denies (user initiated)', async () => {
            const props = createDefaultProps();
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            mockRequestLocationPermission.mockResolvedValue(RESULTS.BLOCKED);

            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('confirmText')).toBe('common.continue');

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('confirmText')).toBe('common.settings');
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            expect(props.onDeny).toHaveBeenCalledWith(true);
        });

        it('Prompt -> Confirm while Blocked -> opens Settings and only resets', async () => {
            const props = createDefaultProps();
            const openSettings = jest.fn().mockResolvedValue(undefined);

            // Given the permission is blocked and the platform can open the OS settings
            mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);
            setOpenSettings(openSettings);

            renderAndroidLocationPermissionModal(props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps "Settings"
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // Then the user leaves for Settings without a decision, so the flow is only reset and neither a grant nor a denial is reported
            expect(openSettings).toHaveBeenCalledTimes(1);
            expect(props.resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.onGrant).not.toHaveBeenCalled();
        });

        it('Prompt -> backdrop dismissal with caller resetting startPermissionFlow -> re-opening -> Not Now -> reports denial', async () => {
            // Given the prompt is open and the caller resets startPermissionFlow on resetPermissionFlow
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            let startFlow = true;
            const onDeny = jest.fn();
            const onGrant = jest.fn();
            const resetPermissionFlow = jest.fn(() => {
                startFlow = false;
            });

            const {rerender} = render(
                <AndroidLocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the user taps the backdrop, which triggers reset and causes the caller to set startPermissionFlow=false
            await act(async () => {
                getShowConfirmModalOption('onBackdropPress')?.();
            });
            rerender(
                <AndroidLocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            expect(mockCloseModal).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // And a new flow starts and the user taps Not now
            startFlow = true;
            rerender(
                <AndroidLocationPermissionModal
                    startPermissionFlow={startFlow}
                    resetPermissionFlow={resetPermissionFlow}
                    onGrant={onGrant}
                    onDeny={onDeny}
                />,
            );
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then each flow reports exactly one outcome: a reset for the backdrop, and a user-initiated denial for Not now because the backdrop flag did not leak
            expect(resetPermissionFlow).toHaveBeenCalledTimes(1);
            expect(onDeny).toHaveBeenCalledTimes(1);
            expect(onDeny).toHaveBeenCalledWith(true);
            expect(onGrant).not.toHaveBeenCalled();
        });
        it('Prompt -> caller unmounts while the prompt is open -> closes the prompt and reports nothing', async () => {
            const props = createDefaultProps();
            // Given the permission has not been decided yet, so the prompt is shown
            mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
            const {unmount} = renderAndroidLocationPermissionModal(props);
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            // When the caller unmounts and the prompt then resolves as closed
            unmount();
            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Then the prompt is closed and no outcome reaches the unmounted caller
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
            expect(props.resetPermissionFlow).not.toHaveBeenCalled();
        });
    });
});
