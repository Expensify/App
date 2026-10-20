/**
 * Whether an email belongs to the Expensify team (partner or guides domain).
 * Its own file so domains.ts can use it without importing members.ts, which pulls in actions/BankAccounts.
 */
import CONST from '@src/CONST';

import {Str} from 'expensify-common';

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

// eslint-disable-next-line import/prefer-default-export -- re-exported through the PolicyUtils barrel's `export *`, which skips default exports
export {isExpensifyTeam};
