import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

function getMergeErrorPage(err: string): ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | null {
    if (err.includes(CONST.MERGE_ACCOUNT_ADMIN_APPROVAL_REQUIRED_ERROR)) {
        return CONST.MERGE_ACCOUNT_RESULTS.ADMIN_APPROVAL_REQUESTED;
    }

    if (err.includes('403')) {
        return CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS;
    }

    if (err.includes('401 Cannot merge accounts - 2FA enabled')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA;
    }

    if (err.includes('401 Not authorized - domain under control')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL;
    }

    if (err.includes('405 Cannot merge account under invoicing')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING;
    }

    if (err.includes('405 Cannot merge SmartScanner account')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER;
    }

    if (err.includes('405 Cannot merge into unvalidated account')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED;
    }

    if (err.includes('413')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED;
    }

    return null;
}

export default getMergeErrorPage;
