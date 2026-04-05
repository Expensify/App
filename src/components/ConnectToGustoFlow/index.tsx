import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import {connectPolicyToGusto} from '@libs/actions/connections/Gusto';
import type {ConnectToGustoFlowProps} from './types';

function ConnectToGustoFlow({policyID}: ConnectToGustoFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        connectPolicyToGusto(policyID, environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToGustoFlow;
