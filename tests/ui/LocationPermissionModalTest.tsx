import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import LocationPermissionModal from '@components/LocationPermissionModal';
import AndroidLocationPermissionModal from '@components/LocationPermissionModal/index.android';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type MockConfirmModalProps = Record<string, unknown>;

const mockGetLocationPermission = jest.fn();
const mockRequestLocationPermission = jest.fn();

let mockConfirmModalProps: MockConfirmModalProps = {};

jest.mock('@components/ConfirmModal', () => {
    function MockConfirmModal(props: Record<string, unknown>) {
        mockConfirmModalProps = props;
        return null;
    }

    MockConfirmModal.displayName = 'ConfirmModal';
    return MockConfirmModal;
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
    getLocationPermission: (...args: unknown[]) => mockGetLocationPermission(...args) as Promise<string>,
    requestLocationPermission: (...args: unknown[]) => mockRequestLocationPermission(...args) as Promise<string>,
}));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
}));

const originalOpenSettings = Linking.openSettings?.bind(Linking);
const mockGetPlatform = getPlatform as jest.MockedFunction<typeof getPlatform>;

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

function getConfirmModalProp<T>(prop: string): T | undefined {
    return mockConfirmModalProps[prop] as T | undefined;
}

function renderLocationPermissionModal(props: ReturnType<typeof createDefaultProps>) {
    render(
        <LocationPermissionModal
            onDeny={props.onDeny}
            onGrant={props.onGrant}
            resetPermissionFlow={props.resetPermissionFlow}
            startPermissionFlow={props.startPermissionFlow}
        />,
    );
}

function renderAndroidLocationPermissionModal(props: ReturnType<typeof createDefaultProps>) {
    render(
        <AndroidLocationPermissionModal
            onDeny={props.onDeny}
            onGrant={props.onGrant}
            resetPermissionFlow={props.resetPermissionFlow}
            startPermissionFlow={props.startPermissionFlow}
        />,
    );
}

describe('LocationPermissionModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockConfirmModalProps = {};
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.GRANTED);
        setOpenSettings(originalOpenSettings);
    });

    afterAll(() => {
        setOpenSettings(originalOpenSettings);
        jest.restoreAllMocks();
    });

    it('passes a user-initiated denial when the user explicitly skips the prompt', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(getConfirmModalProp<boolean>('isVisible')).toBe(true));

        // Given the location prompt is visible, when the user presses "Not now",
        // Then consumers should treat this as an explicit skip and keep the prompt delay behavior.
        await act(async () => {
            getConfirmModalProp<() => void>('onCancel')?.();
        });

        expect(props.onDeny).toHaveBeenCalledWith(true);
    });

    it('passes a non-user-initiated denial when blocked browser permission is still blocked after confirm', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);
        setOpenSettings(undefined);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(getConfirmModalProp<boolean>('isVisible')).toBe(true));

        expect(getConfirmModalProp<string>('confirmText')).toBe('common.buttonConfirm');
        expect(getConfirmModalProp<boolean>('shouldShowCancelButton')).toBe(false);

        // Given web geolocation is already blocked, when the user confirms the app prompt,
        // Then consumers should not treat the browser refusal as an explicit user skip.
        await act(async () => {
            getConfirmModalProp<() => void>('onConfirm')?.();
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
        expect(mockRequestLocationPermission).not.toHaveBeenCalled();
    });

    it('passes a non-user-initiated denial when the OS denies after the user tries to continue', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(getConfirmModalProp<boolean>('isVisible')).toBe(true));

        // Given the app can request permission, when the platform denies that request,
        // Then consumers should continue without writing the explicit-skip prompt delay.
        await act(async () => {
            getConfirmModalProp<() => void>('onConfirm')?.();
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
        expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1);
    });

    it('passes a non-user-initiated denial from Android when the OS denies after continue', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderAndroidLocationPermissionModal(props);

        await waitFor(() => expect(getConfirmModalProp<boolean>('isVisible')).toBe(true));

        // Given Android shows the permission prompt, when the OS denies after "Continue",
        // Then consumers should not write the explicit-skip prompt delay.
        await act(async () => {
            getConfirmModalProp<() => void>('onConfirm')?.();
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
    });

    it('passes a user-initiated denial from Android when the user explicitly skips the prompt', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);

        renderAndroidLocationPermissionModal(props);

        await waitFor(() => expect(getConfirmModalProp<boolean>('isVisible')).toBe(true));

        // Given Android shows a blocked-permission prompt, when the user presses "Not now",
        // Then consumers should keep the explicit-skip prompt delay behavior.
        await act(async () => {
            getConfirmModalProp<() => void>('onCancel')?.();
        });

        expect(props.onDeny).toHaveBeenCalledWith(true);
    });
});
