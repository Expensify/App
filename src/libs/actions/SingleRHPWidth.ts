import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Saves the width once a drag ends, since mid-drag widths only live in CSS. */
function setSingleRHPWidth(width: number) {
    Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, width);
}

/** Drops the dragged width, so the RHP goes back to its default width. */
function clearSingleRHPWidth() {
    Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, null);
}

export {setSingleRHPWidth, clearSingleRHPWidth};
