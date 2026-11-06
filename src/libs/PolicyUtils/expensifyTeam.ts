/**
 * Its own file so domains.ts can use isExpensifyTeam without importing members.ts, which pulls in actions/BankAccounts.
 */
import CONST from '@src/CONST';

import {Str} from 'expensify-common';

/**
 * Whether an email belongs to the Expensify team (partner or guides domain).
 */
function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/** Whether Expensify team members should be hidden from the given policy/user combination. */
function shouldFilterExpensifyTeam(policyOwner: string | undefined, currentUserLogin: string | undefined): boolean {
    return !!policyOwner && !!currentUserLogin && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin);
}

/**
 * Whether a login should be hidden from a cardholder picker because it belongs to Expensify staff, who are also hidden from the Workspace Members page.
 * The current cardholder is never hidden, so editing an existing assignment doesn't blank out the selection.
 */
function shouldHideExpensifyTeamCardholder(
    login: string | null | undefined,
    currentCardholderLogin: string | undefined,
    policyOwner: string | undefined,
    currentUserLogin: string | undefined,
): boolean {
    return !!login && login !== currentCardholderLogin && isExpensifyTeam(login) && shouldFilterExpensifyTeam(policyOwner, currentUserLogin);
}

export {isExpensifyTeam, shouldFilterExpensifyTeam, shouldHideExpensifyTeamCardholder};
