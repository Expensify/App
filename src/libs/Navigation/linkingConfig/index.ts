/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import config from './config';
import customGetPathFromState from './customGetPathFromState';
import getAdaptedStateFromPath from './getAdaptedStateFromPath';
import prefixes from './prefixes';

const linkingConfig: LinkingOptions<RootStackParamList> = {
    getStateFromPath: (...args) => {
        const {adaptedState} = getAdaptedStateFromPath(...args);

        // ResultState | undefined is the type this function expect.
        return adaptedState;
    },
    getPathFromState: customGetPathFromState,
    prefixes,
    config,
};

export default linkingConfig;
