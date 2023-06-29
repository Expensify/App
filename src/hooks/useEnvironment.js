import {useState, useEffect} from 'react';
import CONST from '../CONST';
import * as Environment from '../libs/Environment/Environment';

export default function useEnvironment() {
    const [environment, setEnvironment] = useState(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);

    useEffect(() => {
        Environment.getEnvironment().then(setEnvironment);
        Environment.getEnvironmentURL().then(setEnvironmentURL);
    }, []);

    return {
        environment,
        environmentURL,
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
    };
}
