import {resolveActiveServer} from '@libs/ApiUtils';
import type {ActiveServerState} from '@libs/ApiUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useEnvironment from './useEnvironment';
import useOnyx from './useOnyx';

function useActiveServer(): ActiveServerState {
    const [storedServer] = useOnyx(ONYXKEYS.ACTIVE_SERVER);
    const {environment} = useEnvironment();

    return resolveActiveServer(storedServer, environment);
}

export default useActiveServer;
