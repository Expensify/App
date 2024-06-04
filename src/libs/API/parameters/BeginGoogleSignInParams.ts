import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
};

export default BeginGoogleSignInParams;
