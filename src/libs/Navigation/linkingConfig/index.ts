import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import type {LinkingOptions} from '@react-navigation/native';

import {config} from './config';
import isNativeOAuthCallbackURL from './isNativeOAuthCallbackURL';
import prefixes from './prefixes';
import subscribe from './subscribe';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    getPathFromState,
    prefixes,
    config,
    subscribe,
    // Native only: react-navigation reads `filter` in useLinking.native, not on web. There it covers both the
    // initial URL and later `url` events. The native OAuth callback is consumed by the auth session that opened
    // it, so routing it would only land on NotFound and tear down the returning screen. The signed-out path goes
    // through openReportFromDeepLink instead, which has its own guard.
    filter: (url) => !isNativeOAuthCallbackURL(url),
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
