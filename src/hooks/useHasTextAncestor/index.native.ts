import {useContext} from 'react';
import {unstable_TextAncestorContext as TextAncestorContext} from 'react-native';

export default function useHasTextAncestor(): boolean {
    return useContext(TextAncestorContext);
}
