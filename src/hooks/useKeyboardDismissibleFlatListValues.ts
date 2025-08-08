import {useContext} from 'react';
import {KeyboardDismissibleFlatListContext} from '@components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';

export default function useKeyboardDismissibleFlatListValues() {
    return useContext(KeyboardDismissibleFlatListContext);
}
