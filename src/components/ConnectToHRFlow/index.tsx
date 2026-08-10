import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import type ConnectToHRFlowProps from './types';

function ConnectToHRFlow({setupLink}: ConnectToHRFlowProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        openLink(setupLink, environmentURL, false, session);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [environmentURL, setupLink]);

    return null;
}

export default ConnectToHRFlow;
