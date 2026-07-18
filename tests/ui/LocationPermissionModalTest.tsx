import {act, render, waitFor} from '@testing-library/react-native';

import LocationPermissionModal from '@components/LocationPermissionModal';
import AndroidLocationPermissionModal from '@components/LocationPermissionModal/index.android';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';

const mockGetLocationPermission = jest.fn();
const mockRequestLocationPermission = jest.fn();
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
    getLocationPermission: (...args: unknown[]) => mockGetLocationPermission(...args) as Promise<string>,
    requestLocationPermission: (...args: unknown[]) => mockRequestLocationPermission(...args) as Promise<string>,
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
        resetMockConfirmModal();
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.GRANTED);
        setOpenSettings(originalOpenSettings);
    });

    afterAll(() => {
        setOpenSettings(originalOpenSettings);
        jest.restoreAllMocks();
    });

    it('reports user-initiated denial when the user explicitly skips the prompt', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        await act(async () => {
            resolveShowConfirmModal({action: 'CLOSE'});
        });

        expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
        expect(props.onDeny).toHaveBeenCalledWith(true);
    });

    it('does not update the prompt timestamp when blocked browser permission is still blocked after confirm', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);
        setOpenSettings(undefined);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        expect(getShowConfirmModalOption('confirmText')).toBe('common.buttonConfirm');
        expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

        await act(async () => {
            resolveShowConfirmModal({action: 'CONFIRM'});
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
        expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
        expect(mockRequestLocationPermission).not.toHaveBeenCalled();
    });

    it('does not update the prompt timestamp when the OS denies after the user tries to continue', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderLocationPermissionModal(props);

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        await act(async () => {
            resolveShowConfirmModal({action: 'CONFIRM'});
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
        expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
        expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1);
    });

    it('does not update the prompt timestamp from Android when the OS denies after continue', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.DENIED);
        mockRequestLocationPermission.mockResolvedValue(RESULTS.DENIED);

        renderAndroidLocationPermissionModal(props);

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        await act(async () => {
            resolveShowConfirmModal({action: 'CONFIRM'});
        });

        await waitFor(() => expect(props.onDeny).toHaveBeenCalledWith(false));
        expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
    });

    it('reports user-initiated denial from Android when the user explicitly skips the prompt', async () => {
        const props = createDefaultProps();
        mockGetLocationPermission.mockResolvedValue(RESULTS.BLOCKED);

        renderAndroidLocationPermissionModal(props);

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        await act(async () => {
            resolveShowConfirmModal({action: 'CLOSE'});
        });

        expect(mockUpdateLastLocationPermissionPrompt).not.toHaveBeenCalled();
        expect(props.onDeny).toHaveBeenCalledWith(true);
    });
});
