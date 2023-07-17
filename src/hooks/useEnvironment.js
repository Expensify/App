import {useEffect, useState} from 'react';
import * as Environment from '../libs/Environment/Environment';
import CONST from '../CONST';

export default function useEnvironment() {
    const [environment, setEnvironment] = useState(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);

    useEffect(() => {
        Environment.getEnvironment().then((env) => {
            setEnvironment(env);
        });
        Environment.getEnvironmentURL().then((envUrl) => {
            setEnvironmentURL(envUrl);
        });
    }, []);

    return {
        environment,
        environmentURL,
    };
}
