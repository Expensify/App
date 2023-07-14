import {useContext} from 'react';
import CONST from '../CONST';
import {EnvironmentContext} from '../components/withEnvironment';

export default function useEnvironment() {
    const {environment, environmentURL} = useContext(EnvironmentContext);
    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
    };
}
