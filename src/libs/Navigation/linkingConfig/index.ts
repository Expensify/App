import {hasAuthToken} from '@libs/CurrentUserStore';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import isNativeShareLink from '@libs/Navigation/helpers/isNativeShareLink';
import {shouldParkNativeShare} from '@libs/Navigation/helpers/pendingNativeShare';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import type {LinkingOptions} from '@react-navigation/native';

import {config} from './config';
import isNativeOAuthCallbackURL from './isNativeOAuthCallbackURL';
import prefixes from './prefixes';
import subscribe from './subscribe';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    // Resolve the parser when called: circular navigation imports can leave it uninitialized while this config is created.
    getStateFromPath: (path, options) => getAdaptedStateFromPath(path, options),
    getPathFromState,
    prefixes,
    config,
    subscribe,
    // Native only: react-navigation reads `filter` in useLinking.native, not on web. There it covers both the
    // initial URL and later `url` events. The native OAuth callback is consumed by the auth session that opened
    // it, so routing it would only land on NotFound and tear down the returning screen. The signed-out path goes
    // through openReportFromDeepLink instead, which has its own guard.
    // A native share (`share/root`) that arrives before it is known whether onboarding comes first (signed out, or right
    // after sign-in while the account is still loading) is parked by openReportFromDeepLink and opened once that is
    // settled. Routing it here would mount the share modal just for onboarding to tear it down again (#101425).
    filter: (url) => !isNativeOAuthCallbackURL(url) && !(isNativeShareLink(url) && shouldParkNativeShare(hasAuthToken())),
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
