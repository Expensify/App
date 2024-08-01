import {randEmail, randNumber} from '@ngneat/falso';
import type {Credentials} from '@src/types/onyx';

function getValidCodeCredentials(login = randEmail()): Credentials {
    return {
        login,
        validateCode: `${randNumber()}`,
    };
}

export default getValidCodeCredentials;
