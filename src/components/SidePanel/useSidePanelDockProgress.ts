/** Keeps the CSS that insets the page beside a docked side panel in step with the panel's offset and width. */
import {subscribeToLiveSidePanelWidth, writeSidePanelDockProgress} from '@libs/Navigation/helpers/sidePanelWidth';

import type {RefObject} from 'react';
// The offset is a react-native Animated node driven by the Side Panel and read by react-navigation card styles.
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

import {useInsertionEffect, useLayoutEffect, useRef} from 'react';

/** Returns a ref to the docked width the open and close animations should slide the offset to, read when they start. */
function useSidePanelDockProgress(sidePanelOffset: RefObject<Animated.Value>, dockedSidePanelWidth: number, shouldApplySidePanelOffset: boolean): RefObject<number> {
    const initialDockProgress = useRef(shouldApplySidePanelOffset ? 1 : 0);
    const dockedSidePanelWidthRef = useRef(dockedSidePanelWidth);
    const committedSidePanelWidthRef = useRef(dockedSidePanelWidth);
    const shouldApplySidePanelOffsetRef = useRef(shouldApplySidePanelOffset);

    // CSS reads the offset as a fraction of the width, so a drag that only repaints the width moves the page beside a docked panel too.
    useLayoutEffect(() => {
        const offset = sidePanelOffset.current;
        writeSidePanelDockProgress(initialDockProgress.current);
        const listenerID = offset.addListener(({value}) => writeSidePanelDockProgress(value / dockedSidePanelWidthRef.current));

        return () => offset.removeListener(listenerID);
    }, [sidePanelOffset]);

    // A dragged, reset or re-clamped width moves the page beside a docked panel at once, without the open/close animation.
    const applyDockedWidth = (width: number) => {
        if (dockedSidePanelWidthRef.current === width) {
            return;
        }
        dockedSidePanelWidthRef.current = width;

        if (!shouldApplySidePanelOffsetRef.current) {
            return;
        }
        sidePanelOffset.current.setValue(width);
    };

    // Insertion effects run before every layout effect, so the handle's layout effect that drops the live width after a save already falls back to the saved width.
    useInsertionEffect(() => {
        committedSidePanelWidthRef.current = dockedSidePanelWidth;
        shouldApplySidePanelOffsetRef.current = shouldApplySidePanelOffset;
    }, [dockedSidePanelWidth, shouldApplySidePanelOffset]);

    // The offset also shrinks the super wide RHP and places overlays beside the panel, so it follows a drag too, or those panes lag the page until the drag ends.
    // While docked, the width is set before the offset, so the listener above keeps the dock progress at 1.
    useLayoutEffect(() => subscribeToLiveSidePanelWidth((liveWidth) => applyDockedWidth(liveWidth ?? committedSidePanelWidthRef.current)), [applyDockedWidth]);

    // Before paint, so the page and the panel's own width, whose live value the handle drops in the same commit, never disagree.
    useLayoutEffect(() => applyDockedWidth(dockedSidePanelWidth), [applyDockedWidth, dockedSidePanelWidth]);

    return dockedSidePanelWidthRef;
}

export default useSidePanelDockProgress;
