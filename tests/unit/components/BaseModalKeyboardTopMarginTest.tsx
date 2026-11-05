import {fireEvent, render, screen} from '@testing-library/react-native';

import BaseModal from '@components/Modal/BaseModal';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import type BaseModalProps from '@components/Modal/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const WINDOW_HEIGHT = 874;
const TOP_INSET = 59;
const KEYBOARD_HEIGHT = 300;
// Taller than the room left between the keyboard and the status bar, so a sheet the keyboard lifts would overlap the status bar.
const SHEET_HEIGHT = 780;

// A phone with a keyboard open, where the sheet is the only thing under test. The native modal is replaced by its content.
jest.mock(
    '@components/Modal/ReanimatedModal',
    () =>
        ({children}: ReanimatedModalProps) =>
            children,
);
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: true, shouldUseNarrowLayout: true, isInNarrowPaneModal: false, isInLandscapeMode: false}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 402, windowHeight: WINDOW_HEIGHT}));
jest.mock('@hooks/useSafeAreaInsets', () => () => ({top: TOP_INSET, bottom: 34, left: 0, right: 0}));
jest.mock('@hooks/useKeyboardState', () => () => ({
    isKeyboardActive: true,
    isKeyboardShown: true,
    keyboardHeight: KEYBOARD_HEIGHT,
    keyboardActiveHeight: KEYBOARD_HEIGHT,
    isKeyboardAnimatingRef: {current: false},
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useSidePanelState', () => () => ({sidePanelOffset: {current: 0}}));
jest.mock('@hooks/useSingleRHPWidth', () => () => ({width: 375}));
jest.mock('@hooks/useIsResizableSingleRHP', () => () => false);
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));
jest.mock('@userActions/Modal', () => ({
    areAllModalsHidden: () => true,
    closeTop: jest.fn(),
    onModalDidClose: jest.fn(),
    setCloseModal: () => () => {},
    setModalCovering: jest.fn(),
    setModalVisibility: jest.fn(),
    willAlertModalBecomeVisible: jest.fn(),
}));

type TestInstance = ReturnType<typeof screen.getByTestId>;

/** The modal's own container, found from the content it wraps: the host view the modal measures through `onLayout` */
function findModalContainer(): TestInstance {
    let node: TestInstance | null = screen.getByTestId('content');
    while (node && typeof node.props.onLayout !== 'function') {
        node = node.parent;
    }
    if (!node) {
        throw new Error('Modal container not found');
    }
    return node;
}

function TallBottomSheet({avoidKeyboard}: Pick<BaseModalProps, 'avoidKeyboard'>) {
    return (
        <BaseModal
            isVisible
            onClose={jest.fn()}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            avoidKeyboard={avoidKeyboard}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View testID="content" />
        </BaseModal>
    );
}

/** Renders a tall bottom sheet while the keyboard is open and lays it out, so the rerender can change how it treats the keyboard */
function renderTallBottomSheet(avoidKeyboard: boolean): ReturnType<typeof render> {
    const result = render(<TallBottomSheet avoidKeyboard={avoidKeyboard} />);
    fireEvent(findModalContainer(), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 402, height: SHEET_HEIGHT}}});
    return result;
}

describe('BaseModal top safe area margin with the keyboard open', () => {
    it('keeps a sheet that does not avoid the keyboard without a top margin', () => {
        // Given a tall bottom sheet that makes room for the keyboard inside itself instead of being lifted by it,
        // like a selection list with a search input on a phone
        // When it is laid out while the keyboard is open
        renderTallBottomSheet(false);

        // Then it gets no top margin: the keyboard never moved it, and the margin would only grow its wrapper over
        // the backdrop above it, swallowing the taps meant to dismiss it
        expect(findModalContainer()).toHaveStyle({marginTop: 0});
    });

    it('offsets a sheet the keyboard lifts so it stays below the status bar', () => {
        // Given a tall bottom sheet that the keyboard pushes up
        // When it is laid out while the keyboard is open
        renderTallBottomSheet(true);

        // Then it is pushed down by the top inset, so it does not end up under the status bar
        expect(findModalContainer()).toHaveStyle({marginTop: TOP_INSET});
    });

    it('drops the top margin once the sheet stops avoiding the keyboard', () => {
        // Given a tall bottom sheet the keyboard lifted, so it got the top margin
        const {rerender} = renderTallBottomSheet(true);
        expect(findModalContainer()).toHaveStyle({marginTop: TOP_INSET});

        // When it stops avoiding the keyboard while still open, like a selection list whose search input goes away
        rerender(<TallBottomSheet avoidKeyboard={false} />);

        // Then the margin is gone, so the backdrop above it gets the taps meant to dismiss it again
        expect(findModalContainer()).toHaveStyle({marginTop: 0});
    });
});
