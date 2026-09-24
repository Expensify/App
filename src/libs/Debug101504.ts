import {WRITE_COMMANDS} from '@libs/API/types';

import type Middleware from './Middleware/types';

/**
 * TEMPORARY instrumentation for https://github.com/Expensify/App/issues/101504
 * (Support better rule creation suggestions).
 *
 * Logs the full raw response of every expense-edit command, so we can see whether Auth already sends
 * `suggestNewRuleCreation`, what shape it takes, and how many identical edits it takes to flip.
 *
 * Grep the console for `[D101504]`. Delete this file and its registration in src/libs/Middleware/register.ts
 * before opening a PR.
 */
const WATCHED_COMMANDS = new Set<string>([
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_AMOUNT,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_VENDOR,
]);

const Debug101504: Middleware = (requestResponse, request) => {
    if (!WATCHED_COMMANDS.has(request.command)) {
        return requestResponse;
    }

    return requestResponse.then((response) => {
        const keys = response ? Object.keys(response) : [];
        // Printed separately from the body below, because the body is long enough that the interesting keys scroll away.
        console.log(`[D101504] ${request.command} responseKeys`, keys.join(', '));
        console.log(`[D101504] ${request.command} suggestNewRuleCreation`, JSON.stringify((response as Record<string, unknown>)?.suggestNewRuleCreation ?? null));
        console.log(`[D101504] ${request.command} params`, JSON.stringify(request.data ?? {}));
        console.log(`[D101504] ${request.command} response`, JSON.stringify(response ?? null));
        return response;
    });
};

export default Debug101504;
