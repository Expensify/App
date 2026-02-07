import {useContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import {unstable_TextAncestorContext as TextAncestorContext} from 'react-native';

export default function useHasTextAncestor(): boolean {
    return useContext(TextAncestorContext);
}
