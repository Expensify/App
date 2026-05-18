import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import getZenefitsSetupLink from '@libs/actions/connections/Zenefits';
import {openLink} from '@userActions/Link';
import type ConnectToZenefitsFlowProps from './types';

function ConnectToZenefitsFlow({policyID}: ConnectToZenefitsFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(getZenefitsSetupLink(policyID), environmentURL);
    }, [environmentURL, policyID]);

    return null;
}

export default ConnectToZenefitsFlow;
