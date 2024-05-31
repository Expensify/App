/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import CONST from '@src/CONST';
import config from './config';
import customGetPathFromState from './customGetPathFromState';
import getAdaptedStateFromPath from './getAdaptedStateFromPath';

const linkingConfig: LinkingOptions<RootStackParamList> = {
    getStateFromPath: (...args) => {
        const {adaptedState} = getAdaptedStateFromPath(...args);

        // ResultState | undefined is the type this function expect.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return adaptedState;
    },
    getPathFromState: customGetPathFromState,
    prefixes: [
        'app://-/',
        'new-expensify://',
        'https://www.expensify.cash',
        'https://staging.expensify.cash',
        'https://dev.new.expensify.com',
        CONST.NEW_EXPENSIFY_URL,
        CONST.STAGING_NEW_EXPENSIFY_URL,
    ],
    config,
};

export default linkingConfig;
