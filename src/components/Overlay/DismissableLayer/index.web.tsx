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

import React, {useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

import type {DismissableLayerProps} from './types';

function nodeContains(node: AnchorNode | null, target: Node): boolean {
    const host = asHostElement(node);
    return host?.contains(target) ?? false;
}

function useLayerEntry(kind: DismissableLayerKind): DismissableLayerEntry {
    const [entry] = useState<DismissableLayerEntry>(() => ({
        kind,
        mountId: nextLayerMountId(),
    }));
    // Layout phase (not passive) so the layer is topmost on the first committed frame — Escape/outside/aria-hide active immediately and released synchronously on unmount, matching useOverlayEntry.
    useLayoutEffect(() => pushDismissableLayer(entry), [entry]);
    return entry;
}

function useIsTopLayer(entry: DismissableLayerEntry): boolean {
    const top = useSyncExternalStore(
        dismissableLayerStore.subscribe,
        () => selectTopLayer(dismissableLayerStore.getSnapshot()),
        () => selectTopLayer(dismissableLayerStore.getServerSnapshot()),
    );
    return top === entry;
}

// Only ModalLayer needs the per-kind top, so floating layers never open this second subscription.
function useIsTopOfKind(entry: DismissableLayerEntry): boolean {
    const topOfKind = useSyncExternalStore(
        dismissableLayerStore.subscribe,
        () => selectTopLayer(dismissableLayerStore.getSnapshot(), entry.kind),
        () => selectTopLayer(dismissableLayerStore.getServerSnapshot(), entry.kind),
    );
    return topOfKind === entry;
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
            // Topmost layer always halts propagation so background Esc shortcuts can't fire — even mid-composition.
            event.stopPropagation();
            // Mid-composition Esc cancels the IME (don't preventDefault) and must not dismiss.
            if (event.isComposing) {
                return;
            }
            event.preventDefault();
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
    const isTop = useIsTopLayer(useLayerEntry('floating'));
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
    const entry = useLayerEntry('modal');
    const isTop = useIsTopLayer(entry);
    const isTopOfKind = useIsTopOfKind(entry);
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
    const isTop = useIsTopLayer(useLayerEntry('floating'));
    // Gate on stack z-order only — a covering v2 modal has a higher mountId, so cover-close is a consumer concern (Popover/PopoverMenu v2), not this gate.
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
