/**
 * @jest-environment jsdom
 */
import {act, render} from '@testing-library/react-native';

import DismissableLayer from '@components/Overlay/DismissableLayer/index.web';
import usePointerDownOutside from '@components/Overlay/hooks/usePointerDownOutside';
import Text from '@components/Text';

import type {ReactNode} from 'react';

import React from 'react';

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));
jest.mock('@hooks/useTheme', () => () => ({
    overlay: '#000',
    componentBG: '#fff',
}));
jest.mock('@components/Overlay/hooks/useBodyScrollLock', () => () => {});
jest.mock('@components/Overlay/hooks/useAriaHideSiblings', () => () => {});
let mockIsCovering = false;
jest.mock('@components/Overlay/hooks/useOverlaySelectors', () => ({
    useIsModalCovering: () => mockIsCovering,
}));
jest.mock('@components/Overlay/hooks/usePointerDownOutside', () => jest.fn());

function dispatchEscape() {
    const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});
    act(() => {
        document.dispatchEvent(event);
    });
}

function dispatchEscapeFromBody() {
    const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});
    act(() => {
        document.body.dispatchEvent(event);
    });
}

function ModalContent({children}: {children?: ReactNode}) {
    return <Text>{children ?? null}</Text>;
}

describe('Escape topmost-stack gating', () => {
    it('only the topmost Modal layer dismisses on Escape', () => {
        const dismissA = jest.fn();
        const dismissB = jest.fn();

        render(
            <DismissableLayer.Modal onDismiss={dismissA}>
                <ModalContent>Layer A</ModalContent>
                <DismissableLayer.Modal onDismiss={dismissB}>
                    <ModalContent>Layer B</ModalContent>
                </DismissableLayer.Modal>
            </DismissableLayer.Modal>,
        );

        dispatchEscape();
        expect(dismissB).toHaveBeenCalledTimes(1);
        expect(dismissA).toHaveBeenCalledTimes(0);
    });

    it('once the top layer unmounts, the next layer becomes dismissable on Escape', () => {
        const dismissA = jest.fn();
        const dismissB = jest.fn();
        const tree = (showB: boolean) => (
            <DismissableLayer.Modal onDismiss={dismissA}>
                <ModalContent>Layer A</ModalContent>
                {showB && (
                    <DismissableLayer.Modal onDismiss={dismissB}>
                        <ModalContent>Layer B</ModalContent>
                    </DismissableLayer.Modal>
                )}
            </DismissableLayer.Modal>
        );

        const {rerender} = render(tree(true));

        dispatchEscape();
        expect(dismissB).toHaveBeenCalledTimes(1);
        expect(dismissA).toHaveBeenCalledTimes(0);

        rerender(tree(false));

        dispatchEscape();
        expect(dismissA).toHaveBeenCalledTimes(1);
        expect(dismissB).toHaveBeenCalledTimes(1);
    });

    it('escapeBehavior="ignore" suppresses dismissal but does not pass control to the layer below', () => {
        const dismissA = jest.fn();
        const dismissB = jest.fn();

        render(
            <DismissableLayer.Modal onDismiss={dismissA}>
                <ModalContent>Layer A</ModalContent>
                <DismissableLayer.Modal
                    onDismiss={dismissB}
                    escapeBehavior="ignore"
                >
                    <ModalContent>Layer B</ModalContent>
                </DismissableLayer.Modal>
            </DismissableLayer.Modal>,
        );

        dispatchEscape();
        expect(dismissB).toHaveBeenCalledTimes(0);
        expect(dismissA).toHaveBeenCalledTimes(0);
    });

    it('escapeBehavior="ignore" still consumes the keydown event so document-level shortcuts behind the modal cannot fire', () => {
        const documentCaptureListener = jest.fn();
        document.addEventListener('keydown', documentCaptureListener, {capture: true});

        try {
            const dismiss = jest.fn();
            render(
                <DismissableLayer.Modal
                    onDismiss={dismiss}
                    escapeBehavior="ignore"
                >
                    <ModalContent>Layer</ModalContent>
                </DismissableLayer.Modal>,
            );

            dispatchEscapeFromBody();

            expect(dismiss).toHaveBeenCalledTimes(0);
            expect(documentCaptureListener).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener('keydown', documentCaptureListener, {capture: true});
        }
    });

    it('consumer veto via event.preventDefault still consumes propagation so handlers behind the modal cannot fire', () => {
        const documentCaptureListener = jest.fn();
        document.addEventListener('keydown', documentCaptureListener, {capture: true});

        try {
            const dismiss = jest.fn();
            render(
                <DismissableLayer.Modal
                    onDismiss={dismiss}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    <ModalContent>Layer</ModalContent>
                </DismissableLayer.Modal>,
            );

            dispatchEscapeFromBody();

            expect(dismiss).toHaveBeenCalledTimes(0);
            expect(documentCaptureListener).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener('keydown', documentCaptureListener, {capture: true});
        }
    });

    it('consumer can veto dismissal via event.preventDefault on the top layer only', () => {
        const dismissA = jest.fn();
        const dismissB = jest.fn();

        render(
            <DismissableLayer.Modal onDismiss={dismissA}>
                <ModalContent>Layer A</ModalContent>
                <DismissableLayer.Modal
                    onDismiss={dismissB}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    <ModalContent>Layer B</ModalContent>
                </DismissableLayer.Modal>
            </DismissableLayer.Modal>,
        );

        dispatchEscape();
        expect(dismissB).toHaveBeenCalledTimes(0);
        expect(dismissA).toHaveBeenCalledTimes(0);
    });

    it('a single floating layer above a modal layer dismisses first', () => {
        const dismissModal = jest.fn();
        const dismissFloating = jest.fn();

        render(
            <DismissableLayer.Modal onDismiss={dismissModal}>
                <ModalContent>Modal</ModalContent>
                <DismissableLayer.Floating onDismiss={dismissFloating}>
                    <ModalContent>Floating</ModalContent>
                </DismissableLayer.Floating>
            </DismissableLayer.Modal>,
        );

        dispatchEscape();
        expect(dismissFloating).toHaveBeenCalledTimes(1);
        expect(dismissModal).toHaveBeenCalledTimes(0);
    });

    it('layer Esc preempts a pre-registered document-capture keydown listener', () => {
        const documentCaptureListener = jest.fn();
        document.addEventListener('keydown', documentCaptureListener, {capture: true});

        try {
            const dismissModal = jest.fn();
            render(
                <DismissableLayer.Modal onDismiss={dismissModal}>
                    <ModalContent>Modal</ModalContent>
                </DismissableLayer.Modal>,
            );

            dispatchEscapeFromBody();

            expect(dismissModal).toHaveBeenCalledTimes(1);
            expect(documentCaptureListener).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener('keydown', documentCaptureListener, {capture: true});
        }
    });
});

describe('LayerHost wrapper — outside-click invariant', () => {
    it('renders the containerRef wrapper with pointerEvents="box-none" (host transparent, children interactive) so it does not unconditionally satisfy the contain-predicate', () => {
        const {root} = render(
            <DismissableLayer onDismiss={jest.fn()}>
                <ModalContent>Inner</ModalContent>
            </DismissableLayer>,
        );

        const matches = root.findAll((node) => Reflect.get(node.props as Record<string, unknown>, 'pointerEvents') === 'box-none');
        expect(matches.length).toBeGreaterThan(0);
    });
});

describe('FloatingLayer — outside-pointer gating while covered', () => {
    afterEach(() => {
        mockIsCovering = false;
    });

    it('disables the outside-pointer listener when a modal covers the topmost floating layer', () => {
        mockIsCovering = true;
        jest.mocked(usePointerDownOutside).mockClear();

        render(
            <DismissableLayer.Floating onDismiss={jest.fn()}>
                <ModalContent>Floating</ModalContent>
            </DismissableLayer.Floating>,
        );

        expect(jest.mocked(usePointerDownOutside).mock.calls.at(-1)?.[2]).toEqual({isActive: false});
    });

    it('enables the outside-pointer listener when the floating layer is topmost and uncovered', () => {
        mockIsCovering = false;
        jest.mocked(usePointerDownOutside).mockClear();

        render(
            <DismissableLayer.Floating onDismiss={jest.fn()}>
                <ModalContent>Floating</ModalContent>
            </DismissableLayer.Floating>,
        );

        expect(jest.mocked(usePointerDownOutside).mock.calls.at(-1)?.[2]).toEqual({isActive: true});
    });
});
