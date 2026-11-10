/**
 * The side panel width a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from.
 * The page beside a docked panel is inset by that width times how far the panel is docked, so it follows a drag without the drag knowing whether the panel is docked.
 */
import createLiveSizeVariable, {toDimensionValue} from '@libs/Navigation/helpers/createLiveSizeVariable';
import type {LiveSizeVariable} from '@libs/Navigation/helpers/createLiveSizeVariable';

import type {DimensionValue} from 'react-native';

const SIDE_PANEL_DOCK_PROGRESS_VARIABLE = '--side-panel-dock-progress';

const cssWidthVariable = createLiveSizeVariable('--side-panel-width');

const liveWidthListeners = new Set<(width: number | undefined) => void>();

function notifyLiveWidthListeners(width: number | undefined) {
    for (const listener of liveWidthListeners) {
        listener(width);
    }
}

/** Also tells subscribers, so the animated offset that shrinks and positions other panes moves with the CSS width mid-drag. */
const sidePanelWidthVariable: LiveSizeVariable = {
    ...cssWidthVariable,
    write: (width) => {
        cssWidthVariable.write(width);
        notifyLiveWidthListeners(width);
    },
    clear: () => {
        cssWidthVariable.clear();
        notifyLiveWidthListeners(undefined);
    },
};

/** Calls `listener` with each width a drag paints, and with `undefined` once the live width is dropped. */
function subscribeToLiveSidePanelWidth(listener: (width: number | undefined) => void): () => void {
    liveWidthListeners.add(listener);
    return () => {
        liveWidthListeners.delete(listener);
    };
}

/** The live width mid-drag, the committed `width` otherwise. */
const getSidePanelWidthStyleValue = sidePanelWidthVariable.getStyleValue;

/** 0 while the panel is hidden or floats over the page, 1 once it is docked, and in between while it slides. */
function writeSidePanelDockProgress(progress: number) {
    document.documentElement.style.setProperty(SIDE_PANEL_DOCK_PROGRESS_VARIABLE, `${progress}`);
}

/** How far the page beside the panel is inset, read by CSS so neither the open animation nor a drag renders the page. */
function getSidePanelInsetStyleValue(width: number): DimensionValue {
    return toDimensionValue(`calc(var(${SIDE_PANEL_DOCK_PROGRESS_VARIABLE}, 0) * ${sidePanelWidthVariable.getReference(width)})`);
}

export {getSidePanelInsetStyleValue, getSidePanelWidthStyleValue, sidePanelWidthVariable, subscribeToLiveSidePanelWidth, writeSidePanelDockProgress};
