import Config from 'react-native-config';
import CONST from '../../../CONST';
import Environment from './types';

/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment(): Promise<Environment> {
    return Promise.resolve((Config?.ENVIRONMENT as Environment) ?? CONST.ENVIRONMENT.DEV);
}

export default getEnvironment;
