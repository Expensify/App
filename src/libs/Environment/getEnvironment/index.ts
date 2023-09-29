import Config from 'react-native-config';
import CONST from '../../../CONST';

/**
 * Returns a promise that resolves with the current environment string value
 */
function getEnvironment(): Promise<string> {
    return Promise.resolve(Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV);
}

export default getEnvironment;
