import { useEffect, useRef } from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationPromptType} from '@components/MultifactorAuthentication/config/types';
import useOnyx from '@hooks/useOnyx';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import {useMultifactorAuthenticationState} from './State';

type PromptContent = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths | undefined;
    shouldDisplayConfirmButton: boolean;
};

/**
 * Selector to check if server has any registered credentials for this account.
 * Note: This checks server state only, not device-local credentials.
 */
function serverHasRegisteredCredentials(data: OnyxEntry<Account>) {
    const credentialIDs = data?.multifactorAuthenticationPublicKeyIDs;
    return credentialIDs && credentialIDs.length > 0;
}

/**
 * Hook to get the prompt content (animation, title, subtitle) for the MFA prompt page.
 * Handles the logic for determining the correct title and subtitle based on:
 * - Whether the user is a returning user (already has biometrics registered)
 * - Whether registration has just been completed
 * - The default content from the prompt configuration
 *
 * Uses context state instead of Onyx for state changes during the flow to avoid
 * timing issues with optimistic updates.
 */
function usePromptContent(promptType: MultifactorAuthenticationPromptType): PromptContent {
    const {state} = useMultifactorAuthenticationState();
    const [serverHasCredentials = false] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: serverHasRegisteredCredentials});
    const [deviceBiometricsState] = useOnyx(ONYXKEYS.DEVICE_BIOMETRICS, {canBeMissing: true});
    const hasEverAcceptedSoftPrompt = deviceBiometricsState?.hasAcceptedSoftPrompt ?? false;
    
    // This one's a real doozy. There's an edge case with the MFA flows where the user's keys were revoked
    // server-side, but the client missed the onyx update clearing them, so the client launches into the authenticate
    // flow, shows the user this screen with the "Let's authenticate you" message,
    //  then finds out mid-flow (after requesting the authentication challenge) that we actually need to restart
    // the whole flow and re-register. This ref is used to prevent UI jank after we clear the relevant state
    // but haven't yet navigated to the beginning of the registration flow (magic code input)
    // Functionally, it acts as a latch for isReturningUser, so that once it becomes true, it'll never become false
    const wasPreviouslyRegisteredRef = useRef(false);

    const contentData = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[promptType];

    // Returning user: server has credentials, but user hasn't approved soft prompt yet
    const isReturningUser = wasPreviouslyRegisteredRef.current || (hasEverAcceptedSoftPrompt && serverHasCredentials && !state.softPromptApproved);

    useEffect(() => {
        if (!isReturningUser) {
            return;
        }
        wasPreviouslyRegisteredRef.current = isReturningUser;
    }, [isReturningUser]);

    let title: TranslationPaths = contentData.title;
    let subtitle: TranslationPaths | undefined = contentData.subtitle;

    // Customize title and subtitle based on the user's scenario:
    // 1. Returning User (isReturningUser): User already has biometrics registered on server and just opened the app.
    //    Show "Let's authenticate you" to guide into the authorization flow.
    // 2. New User Registration Complete (isRegistrationComplete): User just finished registering biometrics in this session.
    //    Show "Now let's authenticate you" to transition from registration to authorization.
    if (isReturningUser) {
        title = 'multifactorAuthentication.letsAuthenticateYou';
        subtitle = undefined;
    } else if (state.isRegistrationComplete && hasEverAcceptedSoftPrompt) {
        title = 'multifactorAuthentication.nowLetsAuthenticateYou';
        subtitle = undefined;
    }

    // Display confirm button only for new users during their first biometric registration.
    // Hide it for: users who already approved the soft prompt, users who finished registration,
    // or returning users with existing server credentials. The button prompts users to enable biometrics.
    const shouldDisplayConfirmButton = !hasEverAcceptedSoftPrompt || (!state.softPromptApproved && !state.isRegistrationComplete && !serverHasCredentials && !wasPreviouslyRegisteredRef.current);

    return {
        animation: contentData.animation,
        title,
        subtitle,
        shouldDisplayConfirmButton,
    };
}

export default usePromptContent;
export {serverHasRegisteredCredentials};
