import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

export default function setFullscreenVisibility(isVisible: boolean) {
    Onyx.merge(ONYXKEYS.FULLSCREEN_VISIBILITY, isVisible);
}
