import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationPrompt} from '@components/MultifactorAuthentication/scenarios/types';

/* eslint-disable @typescript-eslint/naming-convention */
export default {
    'enable-biometrics': {
        animation: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.prompts.enableBiometricsPromptTitle',
        subtitle: 'multifactorAuthentication.prompts.enableBiometricsPromptContent',
    },
    'enable-passkeys': {
        animation: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.prompts.enablePasskeyPromptTitle',
        subtitle: 'multifactorAuthentication.prompts.enablePasskeyPromptContent',
    },
} as const satisfies MultifactorAuthenticationPrompt;
/* eslint-enable @typescript-eslint/naming-convention */
