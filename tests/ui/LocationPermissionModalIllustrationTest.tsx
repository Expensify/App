import {act, render, waitFor} from '@testing-library/react-native';

import LocationPermissionModal from '@components/LocationPermissionModal';
import LocationPermissionModalAndroid from '@components/LocationPermissionModal/index.android';

import type * as LocationPermissionModule from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

import React from 'react';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';

const mockGetLocationPermission = jest.fn<ReturnType<typeof LocationPermissionModule.getLocationPermission>, Parameters<typeof LocationPermissionModule.getLocationPermission>>();

const mockIllustration = function loadedIllustration() {
    return null;
};

let mockIsIllustrationLoading = true;
let rerenderModal: (() => void) | undefined;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyAsset: () => ({asset: mockIllustration, isLoading: mockIsIllustrationLoading}),
}));

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@libs/Visibility', () => ({
    onVisibilityChange: jest.fn(() => jest.fn()),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/LocationPermission', () => ({
    getLocationPermission: (...args: Parameters<typeof LocationPermissionModule.getLocationPermission>) => mockGetLocationPermission(...args),
    requestLocationPermission: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
    RESULTS: {GRANTED: 'granted', DENIED: 'denied', UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', LIMITED: 'limited'},
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

function renderModal({modal, onInitialGetLocationCompleted = jest.fn()}: {modal: typeof LocationPermissionModal; onInitialGetLocationCompleted?: () => void}) {
    const ModalComponent = modal;
    const view = render(
        <ModalComponent
            startPermissionFlow
            onGrant={jest.fn()}
            onDeny={jest.fn()}
            resetPermissionFlow={jest.fn()}
            onInitialGetLocationCompleted={onInitialGetLocationCompleted}
        />,
    );
    rerenderModal = () =>
        view.rerender(
            <ModalComponent
                startPermissionFlow
                onGrant={jest.fn()}
                onDeny={jest.fn()}
                resetPermissionFlow={jest.fn()}
                onInitialGetLocationCompleted={onInitialGetLocationCompleted}
            />,
        );
}

async function finishIllustrationLoading() {
    await act(async () => {
        mockIsIllustrationLoading = false;
    });
    rerenderModal?.();
}

describe('the location prompt illustration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockIsIllustrationLoading = true;
        mockGetLocationPermission.mockResolvedValue('denied');
    });

    it('opens the prompt on the screen and tab variants only once the illustration is there', async () => {
        renderModal({modal: LocationPermissionModal});

        // Given a scan screen that opened before the illustration finished loading
        await act(async () => {
            await Promise.resolve();
        });
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(mockGetLocationPermission).not.toHaveBeenCalled();

        // When the illustration arrives
        await finishIllustrationLoading();

        // Then the prompt opens with it
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        expect(getShowConfirmModalOption('iconSource')).toBe(mockIllustration);
    });

    it('opens the prompt on android only once the illustration is there', async () => {
        renderModal({modal: LocationPermissionModalAndroid});

        await act(async () => {
            await Promise.resolve();
        });
        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        await finishIllustrationLoading();

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        expect(getShowConfirmModalOption('iconSource')).toBe(mockIllustration);
    });

    it('holds the caller spinner until the permission check has run', async () => {
        const onInitialGetLocationCompleted = jest.fn();
        renderModal({modal: LocationPermissionModal, onInitialGetLocationCompleted});

        await act(async () => {
            await Promise.resolve();
        });
        expect(onInitialGetLocationCompleted).not.toHaveBeenCalled();

        await finishIllustrationLoading();

        await waitFor(() => expect(onInitialGetLocationCompleted).toHaveBeenCalledTimes(1));
    });
});
