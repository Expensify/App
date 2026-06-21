import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import AnimatedSurface, {FADE_ONLY_ENTER_SPEC, FADE_ONLY_EXIT_SPEC} from './AnimatedSurface';
import DismissableLayer from './DismissableLayer';
import useAnchoredPosition from './hooks/useAnchoredPosition';
import useOverlayEntry from './hooks/useOverlayEntry';
import type {AnchorNode, AnchorRect} from './libs/measureAnchor';
import type {PopoverOverlayEntry} from './libs/overlayStore';
import Portal from './Portal';
import Presence from './Presence';

type FloatingHostProps = {
    isOpen: boolean;
    anchor: AnchorNode | null;
    anchorRect: AnchorRect | null;
    alignment: AnchorAlignment;
    offsetPx?: number;
    fadeDuration?: number;
    onDismiss: () => void;
    onExitComplete?: () => void;
    surfaceStyle?: StyleProp<ViewStyle>;
    stackId: string;
    containFocus?: boolean;
    children: ReactNode;
};

const DEFAULT_FADE_DURATION_MS = CONST.MODAL.ANIMATION_TIMING.OVERLAY_FADE_IN_WEB;

function FloatingHost({
    isOpen,
    anchor,
    anchorRect,
    alignment,
    offsetPx,
    fadeDuration = DEFAULT_FADE_DURATION_MS,
    onDismiss,
    onExitComplete,
    surfaceStyle,
    stackId,
    containFocus = false,
    children,
}: FloatingHostProps) {
    const {style: positionStyle, available, isPositioned, onContentLayout} = useAnchoredPosition({anchorRect, alignment, offsetPx});

    useOverlayEntry(
        isOpen && anchor
            ? ({
                  kind: CONST.MODAL.MODAL_TYPE.POPOVER,
                  id: stackId,
                  close: onDismiss,
                  escapeBehavior: 'dismiss',
                  anchor,
              } satisfies PopoverOverlayEntry)
            : null,
    );

    const inner = (
        <View>
            <DismissableLayer.Floating
                onDismiss={onDismiss}
                additionalAnchors={anchor ? [anchor] : []}
            >
                <View
                    onLayout={onContentLayout}
                    style={[positionStyle, {maxHeight: available.height, opacity: isPositioned ? 1 : 0}]}
                >
                    <AnimatedSurface
                        enterSpec={FADE_ONLY_ENTER_SPEC}
                        exitSpec={FADE_ONLY_EXIT_SPEC}
                        enterTiming={fadeDuration}
                        exitTiming={fadeDuration}
                        style={surfaceStyle}
                    >
                        {children}
                    </AnimatedSurface>
                </View>
            </DismissableLayer.Floating>
        </View>
    );

    return (
        <Presence
            present={isOpen}
            onExitComplete={onExitComplete}
        >
            <Portal>{containFocus ? <FocusTrapForModal active>{inner}</FocusTrapForModal> : inner}</Portal>
        </Presence>
    );
}

export default FloatingHost;
export {DEFAULT_FADE_DURATION_MS};
export type {FloatingHostProps};
