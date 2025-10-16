import {InteractionManager} from 'react-native';
import type FocusEditAfterCancelDelete from './types';

const focusEditAfterCancelDelete: FocusEditAfterCancelDelete = (textInputRef) => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => textInputRef?.focus());
};

export default focusEditAfterCancelDelete;
