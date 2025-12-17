import {useContext} from 'react';
import {KeyboardDismissibleFlatListContext} from './KeyboardDismissibleFlatListContext';

export default function useKeyboardDismissibleFlatListValues() {
    return useContext(KeyboardDismissibleFlatListContext);
}
