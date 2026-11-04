import navigationRef from '@libs/Navigation/navigationRef';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasNonAnonymousSessionSelector} from '@src/selectors/Session';
import type {Onboarding, Session} from '@src/types/onyx';

import {registerTool} from '@appduct/web';
/**
 * Appduct state tool (PoC).
 *
 * Answers "did I land?" without reading the screen. The .ad ceremony answers it by matching
 * landmark text (`text="Home"`, `role="heading" label="Home"`); 146 measured ceremony failures
 * were that check going stale when App retires copy, not the sign-in failing.
 *
 * hasCompletedGuidedSetupFlowSelector cannot be reused here: an unloaded onboarding NVP answers
 * `true`, so "not loaded yet" and "onboarded" collapse into one answer. This tool reports the
 * load state beside the flag instead of collapsing them.
 */
import Onyx from 'react-native-onyx';

import {emptyInputSchema, rawSchema} from './schema';

function registerAppStateTool(): void {
    registerTool({
        name: 'app_state',
        description:
            'Report whether this build is signed in and past onboarding, from app state rather than the rendered screen. Use it to confirm a landing instead of waiting for visible text. onboardingNvpLoaded separates an unloaded onboarding record from a completed one.',
        inputSchema: emptyInputSchema,
        outputSchema: rawSchema<Record<string, unknown>>({
            type: 'object',
            properties: {
                authenticated: {type: 'boolean', description: 'A session auth token is present.'},
                accountID: {type: ['number', 'null']},
                email: {type: ['string', 'null']},
                onboardingNvpLoaded: {type: 'boolean', description: 'False means the onboarding record has not arrived, so the completed flag is not yet meaningful.'},
                hasCompletedGuidedSetupFlow: {type: ['boolean', 'null'], description: 'null while the record is unloaded.'},
                onboardingUiActive: {type: 'boolean', description: 'The current route belongs to the onboarding flow.'},
                onboardingSkippedByConfig: {type: 'boolean', description: 'CONFIG.SKIP_ONBOARDING in this bundle.'},
                route: {type: ['string', 'null'], description: 'Current route name, null before navigation is ready.'},
            },
            required: ['authenticated', 'onboardingNvpLoaded', 'hasCompletedGuidedSetupFlow', 'onboardingUiActive', 'onboardingSkippedByConfig'],
        }),
        group: 'auth',
        handler: async () => {
            const [session, onboarding] = await Promise.all([readSession(), readOnboarding()]);

            const route = navigationRef.current?.getCurrentRoute()?.name ?? null;
            // An empty record is what OldDot-migrated accounts carry and means "nothing to do";
            // only a populated record with the flag false is a pending flow.
            const loaded = onboarding !== undefined && Object.keys(onboarding).length > 0;
            const completed: boolean | null = loaded ? onboarding.hasCompletedGuidedSetupFlow !== false : null;

            return {
                authenticated: hasNonAnonymousSessionSelector(session),
                accountID: session?.accountID ?? null,
                email: session?.email ?? null,
                onboardingNvpLoaded: loaded,
                hasCompletedGuidedSetupFlow: completed,
                onboardingUiActive: route !== null && route.startsWith('Onboarding'),
                onboardingSkippedByConfig: CONFIG.SKIP_ONBOARDING,
                route,
            };
        },
    });
}

function readSession(): Promise<Session | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.SESSION,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function readOnboarding(): Promise<Onboarding | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.NVP_ONBOARDING,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

type AppStateOutput = {
    authenticated: boolean;
    accountID: number | null;
    email: string | null;
    onboardingNvpLoaded: boolean;
    hasCompletedGuidedSetupFlow: boolean | null;
    onboardingUiActive: boolean;
    onboardingSkippedByConfig: boolean;
    route: string | null;
};

export {registerAppStateTool};
export type {AppStateOutput};
