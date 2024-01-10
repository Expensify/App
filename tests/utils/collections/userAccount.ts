import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

function getValidAccount(credentialLogin = ''): Account {
    return {
        validated: true,
        primaryLogin: credentialLogin,
        isSAMLRequired: false,
        isSAMLEnabled: false,
        isLoading: false,
        requiresTwoFactorAuth: false,
    } as Account;
}

export default CONST.DEFAULT_ACCOUNT_DATA;
export {getValidAccount};
