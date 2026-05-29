import type {LinkingOptions} from '@react-navigation/native';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {config} from './config';
import prefixes from './prefixes';
import subscribe from './subscribe';

// React Navigation generates `/Home` (capitalized) for the public SignInPage screen because
// PublicScreens registers it as `SCREENS.HOME` ('Home') without a path mapping. On HybridApp,
// OldDot can hand NewDot the literal `/Home` URL at cold start, which falls through the `'*'`
// wildcard to NOT_FOUND. Mirror the guard in Link.ts (openReportFromDeepLink) at the cold-start
// boundary so initial state derivation treats `/Home` as the root.
const getStateFromPath: typeof getAdaptedStateFromPath = (path, options) => {
    const normalizedPath = path === `/${SCREENS.HOME}` || path === SCREENS.HOME ? '' : path;
    return getAdaptedStateFromPath(normalizedPath, options);
};

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath,
    getPathFromState,
    prefixes,
    config,
    subscribe,
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
