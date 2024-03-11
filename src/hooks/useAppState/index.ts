export default function useAppState() {
    // Since there's no AppState in web, we'll always return isForeground as true
    return {isForeground: true, isInactive: false, isBackground: false};
}
