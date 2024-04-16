import {InteractionManager} from 'react-native';
import type FocusEditAfterCancelDelete from './types';

const focusEditAfterCancelDelete: FocusEditAfterCancelDelete = (textInputRef) => {
    InteractionManager.runAfterInteractions(() => textInputRef?.focus());
};

export default focusEditAfterCancelDelete;
