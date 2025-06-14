import type {Locale} from '@src/CONST/LOCALES';

type SignUpUserParams = {
    email?: string;
    preferredLocale: Locale | null;
};

export default SignUpUserParams;
