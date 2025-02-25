import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Options = {shouldUpdateNarrowLayout?: boolean; shouldOnlyUpdateNarrowLayout?: boolean};

function triggerSidePane(isOpen: boolean, {shouldUpdateNarrowLayout = false, shouldOnlyUpdateNarrowLayout = false}: Options = {}) {
    const value: OnyxMergeInput<typeof ONYXKEYS.NVP_SIDE_PANE> = {};

    if (!shouldOnlyUpdateNarrowLayout) {
        value.open = isOpen;
    }
    if (shouldUpdateNarrowLayout || shouldOnlyUpdateNarrowLayout) {
        value.openMobile = isOpen;
    }

    Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, value);
}

// eslint-disable-next-line import/prefer-default-export
export {triggerSidePane};
