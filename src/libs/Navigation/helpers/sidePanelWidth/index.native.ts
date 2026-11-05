import type {DimensionValue} from 'react-native';

/** The side panel is full-screen on native and never docks, so nothing drags its width or insets the page. */
function writeLiveSidePanelWidth() {}

function clearLiveSidePanelWidth() {}

function getSidePanelWidthStyleValue(width: number): DimensionValue {
    return width;
}

function writeSidePanelDockProgress() {}

function getSidePanelInsetStyleValue(): DimensionValue {
    return 0;
}

export {clearLiveSidePanelWidth, getSidePanelInsetStyleValue, getSidePanelWidthStyleValue, writeLiveSidePanelWidth, writeSidePanelDockProgress};
