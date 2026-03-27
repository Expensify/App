import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationPrompt} from '@components/MultifactorAuthentication/config/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

/**
 * Configuration for multifactor authentication prompt UI with illustrations and translations.
 * Exported to a separate file to avoid circular dependencies.
 */
export default {
    [VALUES.PROMPT.BIOMETRICS]: {
        illustration: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.verifyYourself.biometrics',
        subtitle: 'multifactorAuthentication.enableQuickVerification.biometrics',
    },
    [VALUES.PROMPT.PASSKEYS]: {
        illustration: Illustrations.EncryptionPasskeys,
        title: 'multifactorAuthentication.verifyYourself.passkeys',
        subtitle: 'multifactorAuthentication.enableQuickVerification.passkeys',
    },
} as const satisfies MultifactorAuthenticationPrompt;
