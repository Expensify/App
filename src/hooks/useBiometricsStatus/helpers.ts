import CONST from '@/src/CONST';
import {AuthTypeName, BiometricsPartialStatus} from './types';

/**
 * Helper function that converts a numeric authentication type from SecureStore into
 * a human-readable string name.
 */
const getAuthTypeName = <T>({type}: BiometricsPartialStatus<T>): AuthTypeName | undefined => Object.values(CONST.BIOMETRICS.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

export {getAuthTypeName};
