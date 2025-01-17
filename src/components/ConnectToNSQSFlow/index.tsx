import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToNSQSFlowProps} from './types';

// s77rt: verify that using a previously connected nsqs is not a supported feature
function ConnectToNSQSFlow({policyID}: ConnectToNSQSFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToNSQSFlow;
