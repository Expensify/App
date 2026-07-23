import {markNativeShortcutFlowIfNeeded} from '@libs/NativeShortcutFlow';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getInitialURLWithTimeout from '@libs/Navigation/helpers/getInitialURLWithTimeout';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';

import type {LinkingOptions} from '@react-navigation/native';

import {config} from './config';
import prefixes from './prefixes';
import subscribe from './subscribe';

/**
 * React Navigation's default `getInitialURL` (incl. its timeout workaround), plus marking the
 * native-shortcut flow before the URL is handed to navigation — guaranteeing the marker is set
 * before the create screen mounts, even on HybridApp cold starts where DeepLinkHandler runs late.
 */
async function getInitialURL(): Promise<string | null | undefined> {
    const url = await getInitialURLWithTimeout(CONST.TIMING.REACT_NAVIGATION_GET_INITIAL_URL_TIMEOUT, undefined);
    markNativeShortcutFlowIfNeeded(url);
    return url;
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
