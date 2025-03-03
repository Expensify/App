import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Options = {shouldUpdateNarrowLayout?: boolean; shouldOnlyUpdateNarrowLayout?: boolean};

function triggerSidePane(isOpen: boolean, {shouldUpdateNarrowLayout = false, shouldOnlyUpdateNarrowLayout = false}: Options = {}) {
    const value: OnyxMergeInput<typeof ONYXKEYS.NVP_SIDE_PANE> = {};

    if (!shouldOnlyUpdateNarrowLayout) {
        value.openLargeScreen = isOpen;
    }
    if (shouldUpdateNarrowLayout || shouldOnlyUpdateNarrowLayout) {
        value.openNarrowScreen = isOpen;
    }

    Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, value);
}

// eslint-disable-next-line import/prefer-default-export
export {triggerSidePane};
