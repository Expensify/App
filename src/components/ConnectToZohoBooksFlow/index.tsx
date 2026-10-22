import useEnvironment from '@hooks/useEnvironment';

import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';

import {openLink} from '@userActions/Link';

import {useEffect} from 'react';

import type {ConnectToZohoBooksFlowProps} from './types';

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        // On web the OAuth setup opens in a new browser tab. Open it inline here (within the connect click's
        // user-gesture window) instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
        openLink(getZohoBooksSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
