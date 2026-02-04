import {useKeyboardDismissibleFlatListActions, useKeyboardDismissibleFlatListState} from './KeyboardDismissibleFlatListContext';

export default function useKeyboardDismissibleFlatListValues() {
    const state = useKeyboardDismissibleFlatListState();
    const actions = useKeyboardDismissibleFlatListActions();
    return {...state, ...actions};
}
