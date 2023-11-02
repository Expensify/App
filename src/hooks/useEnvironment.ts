import {useContext} from 'react';
import CONST from '../CONST';
import {EnvironmentContext} from '../components/withEnvironment';
import type {EnvironmentContextValue} from '../components/withEnvironment';

type UseEnvironment = Partial<EnvironmentContextValue> & {
    isProduction: boolean;
    isDevelopment: boolean;
};

export default function useEnvironment(): UseEnvironment {
    const {environment, environmentURL} = useContext(EnvironmentContext) ?? {};
    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    };
}
