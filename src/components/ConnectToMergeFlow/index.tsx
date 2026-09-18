import useEnvironment from '@hooks/useEnvironment';

import {openLink} from '@userActions/Link';

import {useEffect} from 'react';

import type ConnectToMergeFlowProps from './types';

function ConnectToMergeFlow({setupLink}: ConnectToMergeFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(setupLink, environmentURL);
    }, [environmentURL, setupLink]);

    return null;
}

export default ConnectToMergeFlow;
