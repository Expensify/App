import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';

/**
 * No-op on native — dialog title focus is only needed for web screen readers.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useDialogTitleFocus(titleRef: RefObject<RNText | null>, isInsideDialog: boolean) {
    // No-op on native platforms
}

export default useDialogTitleFocus;
