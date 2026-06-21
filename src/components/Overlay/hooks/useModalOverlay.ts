import {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import asHostElement from '@components/Overlay/libs/asHostElement';
import dismissableLayerStore, {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry} from '@components/Overlay/libs/dismissableLayerStore';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import type {EscapeBehavior} from '@components/Overlay/libs/overlayStore';
import useCallbackRef, {useRefMirror} from '@hooks/useCallbackRef';
import useLocalize from '@hooks/useLocalize';
import useAriaHideSiblings from './useAriaHideSiblings';
import useBodyScrollLock from './useBodyScrollLock';
import useEscapeKeydown from './useEscapeKeydown';
import usePointerDownOutside from './usePointerDownOutside';

type UseModalOverlayInput = {
    isOpen: boolean;
    onClose?: () => void;
    isDismissable?: boolean;
    isKeyboardDismissDisabled?: boolean;
    onBackdropPress?: () => void;
    modal?: boolean;
    additionalAnchors?: AnchorNode[];
    shouldCloseOnInteractOutside?: (target: EventTarget | null) => boolean;
};

type UseModalOverlayResult = {
    containerRef: RefObject<View | null>;
    modalProps: Record<string, never>;
    underlayProps: {
        onPress?: () => void;
        accessible?: boolean;
        accessibilityLabel?: string;
    };
};

function nodeContainsTarget(node: AnchorNode | null, target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
        return false;
    }
    const host = asHostElement(node);
    return host?.contains(target) ?? false;
}

function useModalOverlay({
    isOpen,
    onClose,
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    onBackdropPress,
    modal = true,
    additionalAnchors = [],
    shouldCloseOnInteractOutside,
}: UseModalOverlayInput): UseModalOverlayResult {
    const containerRef = useRef<View | null>(null);
    const {translate} = useLocalize();

    const stableClose = useCallbackRef(() => onClose?.());
    const escapeBehaviorRef = useRefMirror<EscapeBehavior>(isKeyboardDismissDisabled ? 'ignore' : 'dismiss');

    // Allocate mountId on every isOpen→true transition so push order drives ranking.
    const [previousIsOpen, setPreviousIsOpen] = useState(false);
    const [activeMountId, setActiveMountId] = useState<number | null>(null);
    if (previousIsOpen !== isOpen) {
        setPreviousIsOpen(isOpen);
        setActiveMountId(isOpen ? nextLayerMountId() : null);
    }

    const top = useSyncExternalStore(dismissableLayerStore.subscribe, () => selectTopLayer(dismissableLayerStore.getSnapshot()));
    const isTop = activeMountId !== null && top?.mountId === activeMountId;

    useEffect(() => {
        if (activeMountId === null) {
            return undefined;
        }
        const entry: DismissableLayerEntry = {
            kind: modal ? 'modal' : 'floating',
            depth: 0,
            mountId: activeMountId,
            onDismiss: stableClose,
            escapeBehaviorRef,
        };
        return pushDismissableLayer(entry);
    }, [activeMountId, modal, stableClose, escapeBehaviorRef]);

    useEscapeKeydown(
        (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (isKeyboardDismissDisabled) {
                return;
            }
            stableClose();
        },
        {isActive: isTop},
    );

    usePointerDownOutside(
        stableClose,
        (target) => {
            if (nodeContainsTarget(containerRef.current, target)) {
                return true;
            }
            if (additionalAnchors.some((anchor) => nodeContainsTarget(anchor, target))) {
                return true;
            }
            if (shouldCloseOnInteractOutside && !shouldCloseOnInteractOutside(target)) {
                return true;
            }
            return false;
        },
        {isActive: isTop && isDismissable},
    );

    useAriaHideSiblings(containerRef, isOpen && modal);
    useBodyScrollLock(isOpen && modal);

    const resolvedBackdropPress = onBackdropPress ?? (isDismissable ? onClose : undefined);

    return {
        containerRef,
        modalProps: {},
        underlayProps: {
            onPress: resolvedBackdropPress,
            accessible: !!resolvedBackdropPress,
            accessibilityLabel: resolvedBackdropPress ? translate('modal.backdropLabel') : undefined,
        },
    };
}

export default useModalOverlay;
export type {UseModalOverlayInput, UseModalOverlayResult};
