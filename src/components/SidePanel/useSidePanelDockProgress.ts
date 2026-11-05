/** Keeps the CSS that insets the page beside a docked side panel in step with the panel's offset and width. */
import {writeSidePanelDockProgress} from '@libs/Navigation/helpers/sidePanelWidth';

import type {RefObject} from 'react';
// The offset is a react-native Animated node driven by the Side Panel and read by react-navigation card styles.
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

import {useLayoutEffect, useRef} from 'react';

/** Returns a ref to the docked width the open and close animations should slide the offset to, read when they start. */
function useSidePanelDockProgress(sidePanelOffset: RefObject<Animated.Value>, dockedSidePanelWidth: number, shouldApplySidePanelOffset: boolean): RefObject<number> {
    const initialDockProgress = useRef(shouldApplySidePanelOffset ? 1 : 0);
    const dockedSidePanelWidthRef = useRef(dockedSidePanelWidth);

    // CSS reads the offset as a fraction of the width, so a drag that only repaints the width moves the page beside a docked panel too.
    useLayoutEffect(() => {
        const offset = sidePanelOffset.current;
        writeSidePanelDockProgress(initialDockProgress.current);
        const listenerID = offset.addListener(({value}) => writeSidePanelDockProgress(value / dockedSidePanelWidthRef.current));

        return () => offset.removeListener(listenerID);
    }, [sidePanelOffset]);

    // A dragged, reset or re-clamped width moves the page beside a docked panel at once, without the open/close animation.
    // Before paint, so the page and the panel's own width, whose live value the handle drops in the same commit, never disagree.
    useLayoutEffect(() => {
        if (dockedSidePanelWidthRef.current === dockedSidePanelWidth) {
            return;
        }
        dockedSidePanelWidthRef.current = dockedSidePanelWidth;

        if (!shouldApplySidePanelOffset) {
            return;
        }
        sidePanelOffset.current.setValue(dockedSidePanelWidth);
    }, [sidePanelOffset, dockedSidePanelWidth, shouldApplySidePanelOffset]);

    return dockedSidePanelWidthRef;
}

export default useSidePanelDockProgress;
