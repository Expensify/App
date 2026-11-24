import CONST from '@src/CONST';

import Config from 'react-native-config';

import type Environment from './types';

/**
 * Returns the environment synchronously, for code that builds links while rendering
 */
function getCachedEnvironment(): Environment {
    return (Config?.ENVIRONMENT as Environment) ?? CONST.ENVIRONMENT.DEV;
}

function getEnvironment(): Promise<Environment> {
    return Promise.resolve(getCachedEnvironment());
}

export default getEnvironment;
export {getCachedEnvironment};
