/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import customGetPathFromState from '@libs/Navigation/helpers/customGetPathFromState';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import type {RootNavigatorParamList} from '@navigation/types';
import config from './config';
import prefixes from './prefixes';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    getPathFromState: customGetPathFromState,
    prefixes,
    config,
};

export default linkingConfig;
