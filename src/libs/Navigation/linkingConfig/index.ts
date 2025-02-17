/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import customGetPathFromState from '@libs/Navigation/helpers/customGetPathFromState';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {config} from './config';
import prefixes from './prefixes';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    getPathFromState: customGetPathFromState,
    prefixes,
    config,
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};
