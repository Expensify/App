import type {TranslationPaths} from '@src/languages/types';

class AccountExistsError extends Error {
    translationKey: TranslationPaths;

    constructor(accountExists: boolean | undefined) {
        super();
        // If accountExists is undefined, it means we couldn't determine the account status due to an unstable internet connection.
        this.translationKey = accountExists === undefined ? 'common.unstableInternetConnection' : 'testDrive.modal.employee.error';
    }
}

export default AccountExistsError;
