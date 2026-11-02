import {getPersonalDetail} from '@libs/PersonalDetailsStore';

import {isAnonymousUser} from '@userActions/Session';

import type {AppductTool} from './types';

import {currentAccountID, isSignedIn, onboardingCompletedFlag, sessionLogin, state} from './appductState';
import {TOOL_RESULT_SCHEMA} from './types';

/**
 * Report the identity's state without acting. The contract is defined by the CI
 * caller and mirrored in the description below.
 *
 * The login prefers the current personal details (what the profile shows) and
 * falls back to the session/credentials copies: the signed-in email lives in
 * all three and a fresh sign-up fills them in at different times.
 */
function registerGetStateTool(registerTool: (tool: AppductTool) => void) {
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
