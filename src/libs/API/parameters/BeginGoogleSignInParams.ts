import type {Locale} from '@src/CONST/LOCALES';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: Locale | null;
};

export default BeginGoogleSignInParams;
