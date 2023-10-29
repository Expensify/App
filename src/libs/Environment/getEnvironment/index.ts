import Config from 'react-native-config';
import Environment from './types';
import CONST from '@src/CONST';

function getEnvironment(): Promise<Environment> {
    return Promise.resolve((Config?.ENVIRONMENT as Environment) ?? CONST.ENVIRONMENT.DEV);
}

export default getEnvironment;
