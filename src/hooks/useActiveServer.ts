/**
 * Reads the resolved active server, which is not always the stored `ACTIVE_SERVER`: a QA or production
 * bundle pins its own and ignores what is stored. Use this wherever the answer reaches the user, so no
 * screen can name a server the requests do not go to.
 */

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
