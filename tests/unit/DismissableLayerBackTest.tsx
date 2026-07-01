import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import {BackHandler} from 'react-native';
import DismissableLayer from '@components/Overlay/DismissableLayer';
import Text from '@components/Text';

type BackHandlerCallback = () => boolean | null | undefined;
const stub: {handler: BackHandlerCallback | null} = {handler: null};
const removeStub = jest.fn();

jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {flex: 1}}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function LayerContent({children}: {children?: ReactNode}) {
    return <Text>{children ?? null}</Text>;
}

beforeEach(() => {
    stub.handler = null;
    removeStub.mockClear();
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
        stub.handler = handler;
        return {remove: removeStub};
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('DismissableLayer (native) — Android hardware back', () => {
    it('top layer with escapeBehavior "dismiss" calls onDismiss and consumes the event', () => {
        const onDismiss = jest.fn();
        render(
            <DismissableLayer
                onDismiss={onDismiss}
                escapeBehavior="dismiss"
            >
                <LayerContent>Top</LayerContent>
            </DismissableLayer>,
        );

        const handler = stub.handler;
        expect(handler).toBeInstanceOf(Function);
        const consumed = handler?.();
        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(consumed).toBe(true);
    });

    it('top layer with escapeBehavior "ignore" consumes the event WITHOUT calling onDismiss', () => {
        const onDismiss = jest.fn();
        render(
            <DismissableLayer
                onDismiss={onDismiss}
                escapeBehavior="ignore"
            >
                <LayerContent>Top</LayerContent>
            </DismissableLayer>,
        );

        const handler = stub.handler;
        expect(handler).toBeInstanceOf(Function);
        const consumed = handler?.();
        expect(onDismiss).not.toHaveBeenCalled();
        expect(consumed).toBe(true);
    });

    it('only the topmost layer registers a BackHandler; the outer layer is dormant', () => {
        const dismissOuter = jest.fn();
        const dismissInner = jest.fn();
        render(
            <DismissableLayer
                onDismiss={dismissOuter}
                escapeBehavior="dismiss"
            >
                <LayerContent>Outer</LayerContent>
                <DismissableLayer
                    onDismiss={dismissInner}
                    escapeBehavior="dismiss"
                >
                    <LayerContent>Inner</LayerContent>
                </DismissableLayer>
            </DismissableLayer>,
        );

        stub.handler?.();
        expect(dismissInner).toHaveBeenCalledTimes(1);
        expect(dismissOuter).not.toHaveBeenCalled();
    });

    it('once the topmost layer unmounts, the next layer takes over hardware back', () => {
        const dismissOuter = jest.fn();
        const dismissInner = jest.fn();
        const tree = (showInner: boolean) => (
            <DismissableLayer
                onDismiss={dismissOuter}
                escapeBehavior="dismiss"
            >
                <LayerContent>Outer</LayerContent>
                {showInner && (
                    <DismissableLayer
                        onDismiss={dismissInner}
                        escapeBehavior="dismiss"
                    >
                        <LayerContent>Inner</LayerContent>
                    </DismissableLayer>
                )}
            </DismissableLayer>
        );

        const {rerender} = render(tree(true));
        stub.handler?.();
        expect(dismissInner).toHaveBeenCalledTimes(1);
        expect(dismissOuter).not.toHaveBeenCalled();

        rerender(tree(false));
        stub.handler?.();
        expect(dismissOuter).toHaveBeenCalledTimes(1);
    });
});

describe('DismissableLayer.Floating (native) — backdrop interact-outside', () => {
    it('backdrop press dismisses when no shouldCloseOnInteractOutside veto is provided', () => {
        const onDismiss = jest.fn();
        render(
            <DismissableLayer.Floating onDismiss={onDismiss}>
                <LayerContent>Floating</LayerContent>
            </DismissableLayer.Floating>,
        );
        fireEvent.press(screen.getByLabelText('modal.backdropLabel'));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('backdrop press is vetoed when shouldCloseOnInteractOutside returns false', () => {
        const onDismiss = jest.fn();
        render(
            <DismissableLayer.Floating
                onDismiss={onDismiss}
                shouldCloseOnInteractOutside={() => false}
            >
                <LayerContent>Floating</LayerContent>
            </DismissableLayer.Floating>,
        );
        fireEvent.press(screen.getByLabelText('modal.backdropLabel'));
        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('backdrop press dismisses when shouldCloseOnInteractOutside returns true', () => {
        const onDismiss = jest.fn();
        render(
            <DismissableLayer.Floating
                onDismiss={onDismiss}
                shouldCloseOnInteractOutside={() => true}
            >
                <LayerContent>Floating</LayerContent>
            </DismissableLayer.Floating>,
        );
        fireEvent.press(screen.getByLabelText('modal.backdropLabel'));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
