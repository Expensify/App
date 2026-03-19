import {render} from '@testing-library/react-native';
import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import CONST from '@src/CONST';

type CapturedModalProps = {
    initialFocus?: () => HTMLElement | false;
    onModalHide?: () => void;
    children?: React.ReactNode;
};

let mockLatestModalProps: CapturedModalProps | undefined;

const mockGetPlatform = jest.fn<string, []>();
const mockWasRecentKeyboardInteraction = jest.fn<boolean, []>();
const mockClearKeyboardInteractionFlag = jest.fn<void, []>();
const mockGetCapturedAnchorElement = jest.fn<HTMLElement | null, []>();
const mockGetInitialFocusTarget = jest.fn<HTMLElement | false, [{isOpenedViaKeyboard: boolean; containerElementRef: unknown}]>();
const mockRestoreCapturedAnchorFocus = jest.fn<void, [HTMLElement | null]>();
const mockShouldTryKeyboardInitialFocus = jest.fn<boolean, [boolean]>((isOpenedViaKeyboard) => isOpenedViaKeyboard);
const mockIsWebPlatform = jest.fn<boolean, [string]>((platform) => platform === CONST.PLATFORM.WEB);

jest.mock('@components/Modal', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: (props: CapturedModalProps) => {
            mockLatestModalProps = props;
            return ReactModule.createElement('mock-modal', props, props.children);
        },
    };
});

jest.mock('@components/ConfirmContent', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const ReactModule = jest.requireActual<typeof import('react')>('react');

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: () => ReactModule.createElement('mock-confirm-content', null, null),
    };
});

jest.mock('@hooks/useResponsiveLayout', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({isSmallScreenWidth: false}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({pv0: {}}),
}));

jest.mock('@libs/getPlatform', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => mockGetPlatform(),
}));

jest.mock('@libs/NavigationFocusManager', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        wasRecentKeyboardInteraction: () => mockWasRecentKeyboardInteraction(),
        clearKeyboardInteractionFlag: () => mockClearKeyboardInteractionFlag(),
        getCapturedAnchorElement: () => mockGetCapturedAnchorElement(),
    },
}));

jest.mock('@components/ConfirmModal/focusRestore', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    getInitialFocusTarget: (params: {isOpenedViaKeyboard: boolean; containerElementRef: unknown}) => mockGetInitialFocusTarget(params),
    restoreCapturedAnchorFocus: (element: HTMLElement | null) => mockRestoreCapturedAnchorFocus(element),
    shouldTryKeyboardInitialFocus: (isOpenedViaKeyboard: boolean) => mockShouldTryKeyboardInitialFocus(isOpenedViaKeyboard),
    isWebPlatform: (platform: string) => mockIsWebPlatform(platform),
}));

function renderConfirmModal(isVisible = true, onModalHide = jest.fn()) {
    return render(
        <ConfirmModal
            isVisible={isVisible}
            onConfirm={jest.fn()}
            onModalHide={onModalHide}
            title="Test"
        />,
    );
}

describe('ConfirmModal integration focus coverage', () => {
    beforeEach(() => {
        mockLatestModalProps = undefined;
        jest.clearAllMocks();
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockWasRecentKeyboardInteraction.mockReturnValue(false);
        mockGetCapturedAnchorElement.mockReturnValue(null);
        mockGetInitialFocusTarget.mockReturnValue(false);
    });

    it('returns false from initialFocus for mouse/touch opens', () => {
        const {rerender} = renderConfirmModal(false);

        rerender(
            <ConfirmModal
                isVisible
                onConfirm={jest.fn()}
                title="Test"
            />,
        );

        const initialFocus = mockLatestModalProps?.initialFocus;
        expect(typeof initialFocus).toBe('function');
        expect(initialFocus?.()).toBe(false);

        expect(mockShouldTryKeyboardInitialFocus).toHaveBeenCalledWith(false);
        expect(mockGetPlatform).toHaveBeenCalledWith();
        expect(mockIsWebPlatform).not.toHaveBeenCalled();
        expect(mockGetInitialFocusTarget).not.toHaveBeenCalled();
    });

    it('captures keyboard/anchor on open, computes initial focus, and resets keyboard capture on close', () => {
        const anchor = document.createElement('button');
        document.body.appendChild(anchor);
        const focusTarget = document.createElement('button');

        mockWasRecentKeyboardInteraction.mockReturnValue(true);
        mockGetCapturedAnchorElement.mockReturnValue(anchor);
        mockGetInitialFocusTarget.mockReturnValue(focusTarget);

        const {rerender} = renderConfirmModal(false);

        rerender(
            <ConfirmModal
                isVisible
                onConfirm={jest.fn()}
                title="Test"
            />,
        );

        expect(mockWasRecentKeyboardInteraction).toHaveBeenCalledTimes(1);
        expect(mockClearKeyboardInteractionFlag).toHaveBeenCalledTimes(1);
        expect(mockGetCapturedAnchorElement).toHaveBeenCalledTimes(1);

        expect(mockLatestModalProps?.initialFocus?.()).toBe(focusTarget);
        expect(mockShouldTryKeyboardInitialFocus).toHaveBeenCalledWith(true);
        expect(mockGetInitialFocusTarget).toHaveBeenCalledTimes(1);

        rerender(
            <ConfirmModal
                isVisible={false}
                onConfirm={jest.fn()}
                title="Test"
            />,
        );

        rerender(
            <ConfirmModal
                isVisible
                onConfirm={jest.fn()}
                title="Test"
            />,
        );

        expect(mockWasRecentKeyboardInteraction).toHaveBeenCalledTimes(2);
    });

    it('restores captured anchor on modal hide and clears the ref after restore', () => {
        const onModalHide = jest.fn();
        const anchor = document.createElement('button');
        document.body.appendChild(anchor);

        mockGetCapturedAnchorElement.mockReturnValue(anchor);

        const {rerender} = renderConfirmModal(false, onModalHide);

        rerender(
            <ConfirmModal
                isVisible
                onConfirm={jest.fn()}
                onModalHide={onModalHide}
                title="Test"
            />,
        );

        mockLatestModalProps?.onModalHide?.();
        expect(mockRestoreCapturedAnchorFocus).toHaveBeenNthCalledWith(1, anchor);
        expect(onModalHide).toHaveBeenCalledTimes(1);

        mockLatestModalProps?.onModalHide?.();
        expect(mockRestoreCapturedAnchorFocus).toHaveBeenNthCalledWith(2, null);
    });
});
