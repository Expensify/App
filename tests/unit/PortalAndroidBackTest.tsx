import {render} from '@testing-library/react-native';
import React from 'react';
import {nextLayerMountId, pushDismissableLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry} from '@components/Overlay/libs/dismissableLayerStore';
import Portal from '@components/Overlay/Portal';
import Text from '@components/Text';

function makeEntry(escapeBehavior: 'dismiss' | 'ignore' | undefined, onDismiss: () => void): DismissableLayerEntry {
    return {
        kind: 'floating',
        depth: 1,
        mountId: nextLayerMountId(),
        onDismiss,
        escapeBehavior,
    };
}

type AndroidBackHandler = () => void;

function isAndroidBackHandler(value: unknown): value is AndroidBackHandler {
    return typeof value === 'function';
}

function captureOnRequestClose(root: ReturnType<typeof render>['root']): AndroidBackHandler | null {
    const matches = root.findAll((node) => typeof node.props.onRequestClose === 'function');
    const handler: unknown = matches.at(0)?.props.onRequestClose;
    return isAndroidBackHandler(handler) ? handler : null;
}

describe('Portal — Android hardware back via RNModal onRequestClose', () => {
    it('dismisses top layer when escapeBehavior is "dismiss"', () => {
        const onDismiss = jest.fn();
        const unregister = pushDismissableLayer(makeEntry('dismiss', onDismiss));

        const {root} = render(
            <Portal>
                <Text>content</Text>
            </Portal>,
        );

        const onRequestClose = captureOnRequestClose(root);
        expect(onRequestClose).toBeInstanceOf(Function);
        onRequestClose?.();
        expect(onDismiss).toHaveBeenCalledTimes(1);

        unregister();
    });

    it('does NOT dismiss when escapeBehavior is "ignore"', () => {
        const onDismiss = jest.fn();
        const unregister = pushDismissableLayer(makeEntry('ignore', onDismiss));

        const {root} = render(
            <Portal>
                <Text>content</Text>
            </Portal>,
        );

        captureOnRequestClose(root)?.();
        expect(onDismiss).not.toHaveBeenCalled();

        unregister();
    });

    it('is a no-op when no layer is registered', () => {
        const {root} = render(
            <Portal>
                <Text>content</Text>
            </Portal>,
        );

        expect(() => captureOnRequestClose(root)?.()).not.toThrow();
    });

    it('targets the topmost layer when multiple are stacked', () => {
        const dismissOuter = jest.fn();
        const dismissInner = jest.fn();
        const unregisterOuter = pushDismissableLayer(makeEntry('dismiss', dismissOuter));
        const unregisterInner = pushDismissableLayer({
            kind: 'floating',
            depth: 2,
            mountId: nextLayerMountId(),
            onDismiss: dismissInner,
            escapeBehavior: 'dismiss',
        });

        const {root} = render(
            <Portal>
                <Text>content</Text>
            </Portal>,
        );

        captureOnRequestClose(root)?.();
        expect(dismissInner).toHaveBeenCalledTimes(1);
        expect(dismissOuter).not.toHaveBeenCalled();

        unregisterInner();
        unregisterOuter();
    });
});
