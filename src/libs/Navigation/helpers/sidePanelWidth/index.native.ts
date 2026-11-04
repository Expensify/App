import type {DimensionValue} from 'react-native';

/** The Side Panel is full-screen on native, so nothing drags its width. */
function writeLiveSidePanelWidth() {}

function clearLiveSidePanelWidth() {}

function getSidePanelWidthStyleValue(width: number): DimensionValue {
    return width;
}

export {clearLiveSidePanelWidth, getSidePanelWidthStyleValue, writeLiveSidePanelWidth};
