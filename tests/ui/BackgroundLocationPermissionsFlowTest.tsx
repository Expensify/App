import {act, render, waitFor} from '@testing-library/react-native';

import useAndroidBackgroundLocationPermissionsFlow from '@pages/iou/request/step/IOURequestStepDistanceGPS/useBackgroundLocationPermissionsFlow/index.android';
import useIOSBackgroundLocationPermissionsFlow from '@pages/iou/request/step/IOURequestStepDistanceGPS/useBackgroundLocationPermissionsFlow/index.ios';

import type {LocationPermissionResponse} from 'expo-location';

import {getBackgroundPermissionsAsync, getForegroundPermissionsAsync, PermissionStatus, requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync} from 'expo-location';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {checkLocationAccuracy} from 'react-native-permissions';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';

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

const mockGetForegroundPermissions = jest.mocked(getForegroundPermissionsAsync);
const mockGetBackgroundPermissions = jest.mocked(getBackgroundPermissionsAsync);
const mockRequestForegroundPermissions = jest.mocked(requestForegroundPermissionsAsync);
const mockRequestBackgroundPermissions = jest.mocked(requestBackgroundPermissionsAsync);
const mockCheckLocationAccuracy = jest.mocked(checkLocationAccuracy);

const originalOpenSettings = Linking.openSettings?.bind(Linking);
const mockOpenSettings = jest.fn(() => Promise.resolve());

function setOpenSettings(openSettings: typeof Linking.openSettings | undefined) {
    Object.defineProperty(Linking, 'openSettings', {
        configurable: true,
        value: openSettings,
    });
}

function buildPermissionResponse({granted, canAskAgain = true, accuracy}: {granted: boolean; canAskAgain?: boolean; accuracy?: 'fine' | 'coarse' | 'none'}): LocationPermissionResponse {
    return {
        status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
        granted,
        canAskAgain,
        expires: 'never',
        ...(accuracy ? {android: {accuracy}} : {}),
    };
}

function createDefaultProps() {
    return {
        onDeny: jest.fn(),
        onError: jest.fn(),
        onGrant: jest.fn(),
    };
}

/**
 * Hosts the hook and starts the flow on mount, standing in for the button press that starts it in the app. Returns
 * a way to press the button again and to unmount the host.
 */
function renderFlow(useFlow: typeof useAndroidBackgroundLocationPermissionsFlow, props: ReturnType<typeof createDefaultProps>) {
    let startPermissionsFlow: () => void = () => {};

    function FlowHost() {
        startPermissionsFlow = useFlow({
            onDeny: props.onDeny,
            onError: props.onError,
            onGrant: props.onGrant,
        });

        useEffect(() => {
            // The flow must only be started once, like a single button press
            startPermissionsFlow();
        }, []);

        return null;
    }

    const {unmount} = render(<FlowHost />);

    return {startAgain: () => startPermissionsFlow(), unmount};
}

describe('BackgroundLocationPermissionsFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        setOpenSettings(mockOpenSettings);
    });

    afterAll(() => {
        setOpenSettings(originalOpenSettings);
        jest.restoreAllMocks();
    });

    describe('Android', () => {
        it('grants without showing a modal when every permission is already granted', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true, accuracy: 'fine'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));

            renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('denies without showing a modal when the foreground permission is permanently denied', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, canAskAgain: false}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));

            renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(props.onDeny).toHaveBeenCalledTimes(1));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('First Ask -> Allow -> Background modal -> Settings -> grants', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, accuracy: 'none'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockRequestForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true, accuracy: 'fine'}));
            mockRequestBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));

            renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('gps.locationRequiredModal.title');
            // the native prompt must not fire until the First Ask modal has finished hiding
            expect(mockRequestForegroundPermissions).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('title')).toBe('gps.androidBackgroundLocationRequiredModal.title');
            expect(mockRequestBackgroundPermissions).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(props.onDeny).not.toHaveBeenCalled();
        });

        it('First Ask -> Allow -> only coarse accuracy granted -> Precise Location modal -> Settings', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, accuracy: 'none'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockRequestForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true, accuracy: 'coarse'}));

            renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('title')).toBe('gps.preciseLocationRequiredModal.title');
            expect(mockOpenSettings).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockOpenSettings).toHaveBeenCalledTimes(1));
            expect(props.onGrant).not.toHaveBeenCalled();
        });

        it('First Ask -> Dismiss -> stops the flow without asking the OS', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, accuracy: 'none'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));

            renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            expect(mockRequestForegroundPermissions).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
        });

        it('ignores a repeated start while the flow is running and allows a new one once it ended', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, accuracy: 'none'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));

            const {startAgain} = renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);
            startAgain();

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            startAgain();

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            startAgain();
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
        });

        it('does not open the next modal when the screen unmounts while the native prompt is open', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, accuracy: 'none'}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            const {promise: nativePrompt, resolve: answerNativePrompt} = Promise.withResolvers<LocationPermissionResponse>();
            mockRequestForegroundPermissions.mockReturnValue(nativePrompt);

            const {unmount} = renderFlow(useAndroidBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });
            await waitFor(() => expect(mockRequestForegroundPermissions).toHaveBeenCalledTimes(1));

            unmount();
            await act(async () => {
                answerNativePrompt(buildPermissionResponse({granted: true, accuracy: 'fine'}));
            });

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('iOS', () => {
        it('grants without showing a modal when every permission is already granted with full accuracy', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockCheckLocationAccuracy.mockResolvedValue('full');

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('denies without showing a modal when the background permission is permanently denied', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false, canAskAgain: false}));

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(props.onDeny).toHaveBeenCalledTimes(1));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('shows the Precise Location modal straight away when accuracy is already reduced', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockCheckLocationAccuracy.mockResolvedValue('reduced');

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('gps.preciseLocationRequiredModal.title');

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockOpenSettings).toHaveBeenCalledTimes(1));
        });

        it('First Ask -> Allow -> grants', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockRequestForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockRequestBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockCheckLocationAccuracy.mockResolvedValue('full');

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('gps.locationRequiredModal.title');
            expect(mockRequestForegroundPermissions).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(props.onGrant).toHaveBeenCalledTimes(1));
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        // Regression test for the deleted onModalHide ref indirection: the Precise Location modal used to be opened
        // from the First Ask modal's onModalHide, which silently did nothing when the hide animation finished before
        // the user answered the OS prompts. Awaiting showConfirmModal makes the ordering correct by construction.
        it('First Ask -> Allow -> reduced accuracy -> Precise Location modal -> Settings', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockRequestForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockRequestBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: true}));
            mockCheckLocationAccuracy.mockResolvedValue('reduced');

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('title')).toBe('gps.preciseLocationRequiredModal.title');
            expect(props.onGrant).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockOpenSettings).toHaveBeenCalledTimes(1));
        });

        it('First Ask -> Dismiss -> stops the flow without asking the OS', async () => {
            const props = createDefaultProps();
            mockGetForegroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));
            mockGetBackgroundPermissions.mockResolvedValue(buildPermissionResponse({granted: false}));

            renderFlow(useIOSBackgroundLocationPermissionsFlow, props);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            expect(mockRequestForegroundPermissions).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(props.onGrant).not.toHaveBeenCalled();
            expect(props.onDeny).not.toHaveBeenCalled();
        });
    });
});
