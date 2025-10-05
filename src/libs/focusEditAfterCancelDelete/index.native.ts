import {InteractionManager} from 'react-native';
import type FocusEditAfterCancelDelete from './types';

const focusEditAfterCancelDelete: FocusEditAfterCancelDelete = (textInputRef) => {
    // eslint-disable-next-line deprecation/deprecation
    InteractionManager.runAfterInteractions(() => textInputRef?.focus());
};

export default focusEditAfterCancelDelete;
