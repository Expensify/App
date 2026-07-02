import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import {openLink} from '@userActions/Link';
import type ConnectToHRFlowProps from './types';

function ConnectToHRFlow({setupLink}: ConnectToHRFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(setupLink, environmentURL);
    }, [environmentURL, setupLink]);

    return null;
}

export default ConnectToHRFlow;
