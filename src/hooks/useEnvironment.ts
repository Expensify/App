import {useContext} from 'react';
import {EnvironmentContext} from '@components/withEnvironment';
import type {EnvironmentContextValue} from '@components/withEnvironment';
import CONST from '@src/CONST';

type UseEnvironment = EnvironmentContextValue & {
    isProduction: boolean;
    isDevelopment: boolean;
};

export default function useEnvironment(): UseEnvironment {
    const {environment, environmentURL} = useContext(EnvironmentContext);
    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    };
}
