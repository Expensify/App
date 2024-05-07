import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

function getValidAccount(credentialLogin = ''): Account {
    return {
        validated: true,
        primaryLogin: credentialLogin,
        isLoading: false,
        requiresTwoFactorAuth: false,
        travelSettings: {
            accountIDs: {},
            hasAcceptedTerms: false,
        },
    };
}

export default CONST.DEFAULT_ACCOUNT_DATA;
export {getValidAccount};
