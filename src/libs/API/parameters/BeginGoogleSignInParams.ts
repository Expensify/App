import type Locale from '@src/types/onyx/Locale';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: Locale | null;
    deviceInfo: string;
};

export default BeginGoogleSignInParams;
