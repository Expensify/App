import {useContext} from 'react';
import {EnvironmentContext} from '@components/EnvironmentContext';
import type {EnvironmentContextValue} from '@components/EnvironmentContext';
import CONST from '@src/CONST';

type UseEnvironment = EnvironmentContextValue & {
    isProduction: boolean;
    isDevelopment: boolean;
};

export default function useEnvironment(): UseEnvironment {
    const {environment, environmentURL, adjustExpensifyLinksForEnv} = useContext(EnvironmentContext);
    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
        adjustExpensifyLinksForEnv,
    };
}
