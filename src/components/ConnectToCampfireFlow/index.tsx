import {useEffect} from 'react';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {ConnectToCampfireFlowProps} from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ConnectToCampfireFlow(_props: ConnectToCampfireFlowProps) {
    useEffect(() => {
        openExternalLink(CONST.CAMPFIRE_INTEGRATION_URL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToCampfireFlow;
