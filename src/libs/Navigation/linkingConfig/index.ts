import {markNativeShortcutFlowIfNeeded} from '@libs/NativeShortcutFlow';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';

import type {LinkingOptions} from '@react-navigation/native';

import {Linking} from 'react-native';

import {config} from './config';
import prefixes from './prefixes';
import subscribe from './subscribe';

/**
 * Same as React Navigation's default `getInitialURL` (including the timeout workaround for
 * https://github.com/facebook/react-native/issues/25675), but marks the native-shortcut flow
 * before the URL is handed to navigation. On HybridApp cold starts NavigationRoot can mount and
 * consume the initial shortcut URL before DeepLinkHandler's own `getInitialURL()` promise
 * resolves, so marking here guarantees the marker is set before the create screen mounts.
 * Only used on native — web's linking implementation reads from browser history instead.
 */
function getInitialURL(): Promise<string | null | undefined> {
    return Promise.race([
        Linking.getInitialURL(),
        new Promise<undefined>((resolve) => {
            setTimeout(resolve, CONST.TIMING.REACT_NAVIGATION_GET_INITIAL_URL_TIMEOUT);
        }),
    ]).then((url) => {
        markNativeShortcutFlowIfNeeded(url);
        return url;
    });
}

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    getPathFromState,
    prefixes,
    config,
    subscribe,
    getInitialURL,
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
