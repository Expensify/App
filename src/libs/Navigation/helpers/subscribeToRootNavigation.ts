import navigationRef from '@libs/Navigation/navigationRef';

/** Subscribes to root navigation state changes for use with `useSyncExternalStore`. */
export default function subscribeToRootNavigation(onStoreChange: () => void) {
    return navigationRef.addListener('state', onStoreChange);
}
