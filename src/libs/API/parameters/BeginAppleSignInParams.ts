import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type BeginAppleSignInParams = {
    idToken: string | undefined | null;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
};

export default BeginAppleSignInParams;
