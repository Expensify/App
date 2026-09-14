import type Locale from '@src/types/onyx/Locale';

type BeginAppleSignInParams = {
    idToken: string | undefined | null;
    preferredLocale: Locale | null;
    deviceInfo: string;
};

export default BeginAppleSignInParams;
