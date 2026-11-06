import type {LiveSizeVariable} from '@libs/Navigation/helpers/createLiveSizeVariable';

import type {DimensionValue} from 'react-native';

/** The side panel is full-screen on native and never docks, so nothing drags its width or insets the page. */
const sidePanelWidthVariable: LiveSizeVariable = {
    write: () => {},
    clear: () => {},
    getReference: (width) => `${width}px`,
    getStyleValue: (width) => width,
};

const getSidePanelWidthStyleValue = sidePanelWidthVariable.getStyleValue;

function writeSidePanelDockProgress() {}

function subscribeToLiveSidePanelWidth(): () => void {
    return () => {};
}

function getSidePanelInsetStyleValue(): DimensionValue {
    return 0;
}

export {getSidePanelInsetStyleValue, getSidePanelWidthStyleValue, sidePanelWidthVariable, subscribeToLiveSidePanelWidth, writeSidePanelDockProgress};
