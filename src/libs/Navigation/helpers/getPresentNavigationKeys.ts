import navigationRef from '@libs/Navigation/navigationRef';

import extractPresentNavigationKeys from './extractPresentNavigationKeys';

/**
 * Returns every route key present in the current navigation state, including preloaded routes, or undefined when
 * the navigation container is not ready yet.
 */
function getPresentNavigationKeys(): Set<string> | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }
    const rootState = navigationRef.getRootState();
    return rootState ? extractPresentNavigationKeys(rootState) : undefined;
}

export default getPresentNavigationKeys;
