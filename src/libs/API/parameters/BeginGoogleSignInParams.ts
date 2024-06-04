import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | undefined;
};

export default BeginGoogleSignInParams;
