import Config from 'react-native-config';
import CONST from '@src/CONST';
import type Environment from './types';

function getEnvironment(): Promise<Environment> {
    return Promise.resolve((Config?.ENVIRONMENT as Environment) ?? CONST.ENVIRONMENT.DEV);
}

export default getEnvironment;
