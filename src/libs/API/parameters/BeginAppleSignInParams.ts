import type {Locale} from '@src/CONST/LOCALES';

type BeginAppleSignInParams = {
    idToken: string | undefined | null;
    preferredLocale: Locale | null;
};

export default BeginAppleSignInParams;
