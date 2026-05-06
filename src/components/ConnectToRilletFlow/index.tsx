import {useEffect} from 'react';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {ConnectToRilletFlowProps} from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ConnectToRilletFlow(_props: ConnectToRilletFlowProps) {
    useEffect(() => {
        openExternalLink(CONST.RILLET_INTEGRATION_URL);
    }, []);

    return null;
}

export default ConnectToRilletFlow;
