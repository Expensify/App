import React from 'react';
import type {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import AnimatedSurface, {FADE_ONLY_ENTER_SPEC, FADE_ONLY_EXIT_SPEC} from './AnimatedSurface';
import DismissableLayer from './DismissableLayer';
import useAnchoredPosition from './hooks/useAnchoredPosition';
import useDismissOnAnchorMove from './hooks/useDismissOnAnchorMove';
import useOverlayEntry from './hooks/useOverlayEntry';
import type {AnchorNode, AnchorRect} from './libs/measureAnchor';
import type {PopoverOverlayEntry} from './libs/overlayStore';
import Portal from './Portal';
import Presence from './Presence';

type FloatingHostProps = {
    /** Whether the overlay is open — drives the enter/exit animation and dismissal registration */
    isOpen: boolean;

    /** Element the surface is positioned against and treated as "inside" for outside-press detection */
    anchor: AnchorNode | null;

    /** Measured rect of the anchor used to place the surface; `null` until measured */
    anchorRect: AnchorRect | null;

    /** Which edge/corner of the anchor the surface aligns to */
    alignment: AnchorAlignment;

    /** Gap in pixels between the anchor and the surface */
    offsetPx?: number;

    /** Overrides the default enter/exit fade duration, in milliseconds */
    fadeDuration?: number;

    /** Called when the overlay requests to close (Esc, outside press, or the anchor moving offscreen) */
    onDismiss: () => void;

    /** Called after the exit animation finishes and the overlay unmounts */
    onExitComplete?: () => void;

    /** Style applied to the animated surface */
    surfaceStyle?: StyleProp<ViewStyle>;

    /** Stable identifier for this overlay within the modal-cover stack */
    stackId: string;

    /** Whether to trap focus within the overlay while open */
    containFocus?: boolean;

    /** Overlay content */
    children: ReactNode;
};

function FloatingHost({isOpen, anchor, anchorRect, alignment, offsetPx, fadeDuration, onDismiss, onExitComplete, surfaceStyle, stackId, containFocus = false, children}: FloatingHostProps) {
    const {style: positionStyle, available, isPositioned, onContentLayout} = useAnchoredPosition({anchorRect, alignment, offsetPx});
    const enterTiming = fadeDuration ?? CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN;
    const exitTiming = fadeDuration ?? CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT;

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

    useDismissOnAnchorMove(anchor, onDismiss, isOpen && anchor !== null);

    const inner = (
        // absoluteFill bridges FocusTrap's block div back to a sized containing block for the flex:1 child below.
        <View style={StyleSheet.absoluteFill}>
            <DismissableLayer.Floating
                onDismiss={onDismiss}
                additionalAnchors={anchor ? [anchor] : []}
            >
                <View
                    onLayout={onContentLayout}
                    // Measuring with the caps would trap the flip logic at the capped size, so they apply only post-measure.
                    style={[positionStyle, {maxHeight: isPositioned ? available.height : undefined, maxWidth: isPositioned ? available.width : undefined, opacity: isPositioned ? 1 : 0}]}
                >
                    <AnimatedSurface
                        enterSpec={FADE_ONLY_ENTER_SPEC}
                        exitSpec={FADE_ONLY_EXIT_SPEC}
                        enterTiming={enterTiming}
                        exitTiming={exitTiming}
                        // Hold the entrance fade until measured so it can't elapse behind the opacity gate above.
                        enterEnabled={isPositioned}
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
export type {FloatingHostProps};
