import {getPersonalDetail} from '@libs/PersonalDetailsStore';

import {isAnonymousUser} from '@userActions/Session';

import type {AppductTool} from './types';

import {currentAccountID, isSignedIn, onboardingCompletedFlag, sessionLogin, state} from './appductState';
import {TOOL_RESULT_SCHEMA} from './types';

function registerGetStateTool(registerTool: (tool: AppductTool) => void) {
    // Personal details first: a fresh sign-up fills them, the session and the credentials at different times.
    const currentLogin = () => getPersonalDetail(currentAccountID())?.login ?? sessionLogin() ?? null;

    registerTool({
        name: 'get_state',
        description:
            'Report the app state of the current identity without acting: booted, signedIn, anonymous, login, accountID, onboardingCompleted, isLoadingApp. ' +
            'onboardingCompleted is the raw stored flag; null means it has not loaded yet.',
        inputSchema: {type: 'object', properties: {}},
        outputSchema: TOOL_RESULT_SCHEMA,
        timeoutMs: 5_000,
        handler: async () => ({
            ok: true,
            state: {
                booted: !!state.session,
                signedIn: isSignedIn(),
                anonymous: isAnonymousUser(state.session),
                login: currentLogin(),
                accountID: currentAccountID() ?? null,
                onboardingCompleted: onboardingCompletedFlag(),
                isLoadingApp: state.isLoadingApp ?? null,
            },
        }),
    });
}

export default registerGetStateTool;
