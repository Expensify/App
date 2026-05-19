import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import getMergeHRSetupLink from '@libs/actions/connections/MergeHR';
import {openLink} from '@userActions/Link';
import type ConnectToMergeHRFlowProps from './types';

function ConnectToMergeHRFlow({policyID, integration}: ConnectToMergeHRFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(getMergeHRSetupLink(policyID, integration), environmentURL);
    }, [environmentURL, policyID, integration]);

    return null;
}

export default ConnectToMergeHRFlow;
