// TextAncestorContext is not available on web (react-native-web), so always return false.
export default function useHasTextAncestor(): boolean {
    return false;
}
