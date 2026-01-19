import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationPrompt} from '@components/MultifactorAuthentication/config/types';

/**
 * Configuration for multifactor authentication prompt UI with animations and translations.
 */

/* eslint-disable @typescript-eslint/naming-convention */
export default {
    'enable-biometrics': {
        animation: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.verifyYourself.biometrics',
        subtitle: 'multifactorAuthentication.enableQuickVerification.biometrics',
    },
} as const satisfies MultifactorAuthenticationPrompt;
/* eslint-enable @typescript-eslint/naming-convention */
