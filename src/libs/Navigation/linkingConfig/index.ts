/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import CONST from '@src/CONST';
import config from './config';
import getAdaptedStateFromPath from './getAdaptedStateFromPath';

const linkingConfig: LinkingOptions<RootStackParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
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
