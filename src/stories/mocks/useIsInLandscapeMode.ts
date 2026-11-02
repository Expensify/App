import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeMode from '@libs/isInLandscapeMode';

import {useSyncExternalStore} from 'react';

import {getDeviceMode, subscribeToDeviceMode} from './deviceMode';

/**
 * Storybook-only replacement for `@hooks/useIsInLandscapeMode`, aliased in `.storybook/mockPaths.ts`.
 * `@libs/isInLandscapeMode` already resolves to its Storybook mock, which reports the stored device mode, so this hook only adds a
 * subscription to that mode: switching it in a story re-renders the layouts at once, which a window resize alone would not do.
 */
function useIsInLandscapeMode(): boolean {
    const {windowWidth, windowHeight} = useWindowDimensions();
    useSyncExternalStore(subscribeToDeviceMode, getDeviceMode);

    return isInLandscapeMode(windowWidth, windowHeight);
}

export default useIsInLandscapeMode;
