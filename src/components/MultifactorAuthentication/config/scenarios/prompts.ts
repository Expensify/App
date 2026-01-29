import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationPrompt} from '@components/MultifactorAuthentication/config/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

/**
 * Configuration for multifactor authentication prompt UI with animations and translations.
 * Exported to a separate file to avoid circular dependencies.
 */
export default {
    [VALUES.PROMPT.ENABLE_BIOMETRICS]: {
        animation: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.verifyYourself.biometrics',
        subtitle: 'multifactorAuthentication.enableQuickVerification.biometrics',
    },
} as const satisfies MultifactorAuthenticationPrompt;
