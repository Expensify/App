import {useRef} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import asHostElement from '@components/Overlay/libs/asHostElement';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
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

    useEscapeKeydown(
        () => {
            onClose?.();
        },
        {isActive: isOpen && !isKeyboardDismissDisabled},
    );

    usePointerDownOutside(
        () => {
            onClose?.();
        },
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
        {isActive: isOpen && isDismissable},
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
