import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SignUpUserParams = {
    email?: string;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
};

export default SignUpUserParams;
