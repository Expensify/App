import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Options = {
    /** Whether to update the narrow layout along with the large screen layout */
    shouldUpdateNarrowLayout?: boolean;

    /** Whether to update only the narrow layout without affecting the large screen layout */
    shouldOnlyUpdateNarrowLayout?: boolean;
};

/**
 * Updates the side pane state in Onyx.
 *
 * @param isOpen - Determines whether the side pane should be open or closed.
 * @param [options] - Additional options for updating the layout.
 */
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
