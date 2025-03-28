import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Options = {
    /** Determines whether the side pane should be open or closed */
    isOpen?: boolean;

    /** Determines whether the side pane should be open or closed on narrow screens */
    isOpenNarrowScreen?: boolean;
};

/** Updates the side pane state in Onyx */
function triggerSidePane({isOpen, isOpenNarrowScreen}: Options) {
    const value: OnyxMergeInput<typeof ONYXKEYS.NVP_SIDE_PANE> = {};

    if (isOpen !== undefined) {
        value.open = isOpen;
    }
    if (isOpenNarrowScreen !== undefined) {
        value.openNarrowScreen = isOpenNarrowScreen;
    }

    Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, value);
}

// eslint-disable-next-line import/prefer-default-export
export {triggerSidePane};
