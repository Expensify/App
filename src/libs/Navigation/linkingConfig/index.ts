import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import type {LinkingOptions} from '@react-navigation/native';

import {config} from './config';
import prefixes from './prefixes';
import subscribe from './subscribe';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    getPathFromState,
    prefixes,
    config,
    subscribe,
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
