import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import {useEffect} from 'react';

import type ConnectToMergeFlowProps from './types';

function ConnectToMergeFlow({setupLink}: ConnectToMergeFlowProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    useEffect(() => {
        openLink(setupLink, environmentURL, false, session);
    }, [environmentURL, setupLink, session]);

    return null;
}

export default ConnectToMergeFlow;
