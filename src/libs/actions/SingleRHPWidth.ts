import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Saves the width once a drag ends, since mid-drag widths only live in CSS. */
function setSingleRHPWidth(width: number) {
    Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, width);
}

/** Drops the saved width, so the single RHP goes back to the default and follows it if the default changes. */
function resetSingleRHPWidth() {
    Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, null);
}

export {resetSingleRHPWidth, setSingleRHPWidth};
