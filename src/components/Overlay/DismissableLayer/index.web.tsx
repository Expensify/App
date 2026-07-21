import useAriaHideSiblings from '@components/Overlay/hooks/useAriaHideSiblings';
import useBodyScrollLock from '@components/Overlay/hooks/useBodyScrollLock';
import useEscapeKeydown from '@components/Overlay/hooks/useEscapeKeydown';
import usePointerDownOutside from '@components/Overlay/hooks/usePointerDownOutside';
import asHostElement from '@components/Overlay/libs/asHostElement';
import dismissableLayerStore, {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import {PortalContext} from '@components/Overlay/PortalContext';
import type {PortalContextValue} from '@components/Overlay/PortalContext';

import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';

import type {ReactNode} from 'react';

import React, {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

import type {DismissableLayerProps} from './types';

function nodeContains(node: AnchorNode | null, target: Node): boolean {
    const host = asHostElement(node);
    return host?.contains(target) ?? false;
}

function useLayerStack(kind: DismissableLayerKind, trackTopOfKind?: boolean): {isTop: boolean; isTopOfKind: boolean} {
    const [entry] = useState<DismissableLayerEntry>(() => ({
        kind,
        mountId: nextLayerMountId(),
    }));
    const top = useSyncExternalStore(
        dismissableLayerStore.subscribe,
        () => selectTopLayer(dismissableLayerStore.getSnapshot()),
        () => selectTopLayer(dismissableLayerStore.getServerSnapshot()),
    );
    // Only ModalLayer consumes isTopOfKind, so floating layers skip the per-kind O(stack) scan entirely.
    const topOfKind = useSyncExternalStore(
        dismissableLayerStore.subscribe,
        () => (trackTopOfKind ? selectTopLayer(dismissableLayerStore.getSnapshot(), kind) : null),
        () => (trackTopOfKind ? selectTopLayer(dismissableLayerStore.getServerSnapshot(), kind) : null),
    );
    useEffect(() => pushDismissableLayer(entry), [entry]);
    return {
        isTop: top === entry,
        isTopOfKind: trackTopOfKind === true && topOfKind === entry,
    };
}

function useDismissableLayerWorker(
    {onEscapeKeyDown, onPointerDownOutside, onDismiss, escapeBehavior, additionalAnchors, shouldCloseOnInteractOutside}: DismissableLayerProps,
    {isEscapeActive, isPointerOutsideActive}: {isEscapeActive: boolean; isPointerOutsideActive: boolean},
) {
    const containerRef = useRef<View | null>(null);
    const portalNodesRef = useRef<Set<Element>>(new Set());
    const [portalContextValue] = useState<PortalContextValue>(() => ({
        register: (node) => {
            portalNodesRef.current.add(node);
            return () => {
                portalNodesRef.current.delete(node);
            };
        },
    }));

    useEscapeKeydown(
        (event) => {
            let consumerVetoed = false;
            try {
                onEscapeKeyDown?.(event);
                consumerVetoed = event.defaultPrevented;
            } catch (error) {
                Log.alert('[DismissableLayer] onEscapeKeyDown consumer threw', {
                    error: String(error),
                });
            }
            // Topmost layer always consumes Esc — stops ancestors from reacting.
            event.preventDefault();
            event.stopPropagation();
            if (consumerVetoed || escapeBehavior === 'ignore') {
                return;
            }
            onDismiss?.();
        },
        {isActive: isEscapeActive},
    );

    const containsTarget = (target: EventTarget | null) => {
        if (!(target instanceof Node)) {
            return false;
        }
        if (nodeContains(containerRef.current, target)) {
            return true;
        }
        for (const portalNode of portalNodesRef.current) {
            if (portalNode.contains(target)) {
                return true;
            }
        }
        if ((additionalAnchors ?? []).some((anchor) => nodeContains(anchor, target))) {
            return true;
        }
        if (shouldCloseOnInteractOutside && !shouldCloseOnInteractOutside(target)) {
            return true;
        }
        return false;
    };

    usePointerDownOutside(
        (event) => {
            try {
                onPointerDownOutside?.(event);
            } catch (error) {
                Log.alert('[DismissableLayer] onPointerDownOutside consumer threw', {
                    error: String(error),
                });
            }
            if (event.defaultPrevented) {
                return;
            }
            onDismiss?.();
        },
        containsTarget,
        {isActive: isPointerOutsideActive},
    );

    return {containerRef, portalContextValue};
}

function LayerHost({containerRef, portalContextValue, children}: {containerRef: React.RefObject<View | null>; portalContextValue: PortalContextValue; children: ReactNode}) {
    const styles = useThemeStyles();
    return (
        <PortalContext value={portalContextValue}>
            <View
                ref={containerRef}
                style={styles.flex1}
                pointerEvents="box-none"
            >
                {children}
            </View>
        </PortalContext>
    );
}

function DismissableLayer(props: DismissableLayerProps) {
    const {isTop} = useLayerStack('floating');
    const {containerRef, portalContextValue} = useDismissableLayerWorker(props, {isEscapeActive: isTop, isPointerOutsideActive: isTop});
    return (
        <LayerHost
            containerRef={containerRef}
            portalContextValue={portalContextValue}
        >
            {props.children}
        </LayerHost>
    );
}

function ModalLayer(props: DismissableLayerProps) {
    const {isTop, isTopOfKind} = useLayerStack('modal', true);
    const {containerRef, portalContextValue} = useDismissableLayerWorker(props, {isEscapeActive: isTop, isPointerOutsideActive: false});
    useBodyScrollLock(isTopOfKind);
    useAriaHideSiblings(containerRef, isTopOfKind);
    return (
        <LayerHost
            containerRef={containerRef}
            portalContextValue={portalContextValue}
        >
            {props.children}
        </LayerHost>
    );
}

function FloatingLayer(props: DismissableLayerProps) {
    const {isTop} = useLayerStack('floating');
    // Gate on stack z-order only — a covering v2 modal has a higher mountId so this layer is already
    // not-top; modal-cover *closing* is a consumer concern (Popover/PopoverMenu v2), not this gate.
    const {containerRef, portalContextValue} = useDismissableLayerWorker(props, {
        isEscapeActive: isTop,
        isPointerOutsideActive: isTop,
    });
    return (
        <LayerHost
            containerRef={containerRef}
            portalContextValue={portalContextValue}
        >
            {props.children}
        </LayerHost>
    );
}

DismissableLayer.Modal = ModalLayer;
DismissableLayer.Floating = FloatingLayer;

export default DismissableLayer;
export type {DismissableLayerProps, EscapeBehavior} from './types';
