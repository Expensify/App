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

    const contentData = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[promptType];

    // Returning user: server has credentials, but user hasn't approved soft prompt yet
    const isReturningUser = serverHasCredentials && !state.softPromptApproved;

    let title: TranslationPaths = contentData.title;
    let subtitle: TranslationPaths | undefined = contentData.subtitle;

    if (isReturningUser) {
        title = 'multifactorAuthentication.letsAuthenticateYou';
        subtitle = undefined;
    } else if (state.isRegistrationComplete) {
        title = 'multifactorAuthentication.nowLetsAuthenticateYou';
        subtitle = undefined;
    }

    return {
        animation: contentData.animation,
        title,
        subtitle,
    };
}

export default usePromptContent;
export {serverHasRegisteredCredentials};
