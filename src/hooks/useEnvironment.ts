import {useEnvironmentState} from '@components/EnvironmentContextProvider';
import type {EnvironmentStateContextType} from '@components/EnvironmentContextProvider';
import CONST from '@src/CONST';

type UseEnvironment = EnvironmentStateContextType & {
    isProduction: boolean;
    isDevelopment: boolean;
};

export default function useEnvironment(): UseEnvironment {
    const {environment, environmentURL} = useEnvironmentState();
    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    };
}
