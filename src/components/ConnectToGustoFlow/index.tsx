import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import getGustoSetupLink from '@libs/actions/connections/Gusto';
import {openLink} from '@userActions/Link';
import type ConnectToGustoFlowProps from './types';

function ConnectToGustoFlow({policyID}: ConnectToGustoFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(getGustoSetupLink(policyID), environmentURL);
    }, [environmentURL, policyID]);

    return null;
}

export default ConnectToGustoFlow;
