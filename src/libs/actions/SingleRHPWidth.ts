import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Saves the width once a drag ends, since mid-drag widths only live in CSS. */
function setSingleRHPWidth(width: number) {
    Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, width);
}

// eslint-disable-next-line import/prefer-default-export -- additional actions may be added here
export {setSingleRHPWidth};
