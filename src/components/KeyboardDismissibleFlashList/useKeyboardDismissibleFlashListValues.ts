import {useKeyboardDismissibleFlashListActions, useKeyboardDismissibleFlashListState} from './KeyboardDismissibleFlashListContext';

export default function useKeyboardDismissibleFlashListValues() {
    const state = useKeyboardDismissibleFlashListState();
    const actions = useKeyboardDismissibleFlashListActions();
    return {...state, ...actions};
}
