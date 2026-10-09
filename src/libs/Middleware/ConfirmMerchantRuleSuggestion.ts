import {WRITE_COMMANDS} from '@libs/API/types';

import {confirmMerchantRuleSuggestion} from '@userActions/MerchantRuleSuggestion';

import CONST from '@src/CONST';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * The expense edits Auth counts towards a merchant rule. A command maps to one field, which is how the confirmation
 * reaches the field the edit recorded without the response having to name it.
 */
const FIELD_BY_COMMAND: Partial<Record<string, MerchantRuleSuggestionField>> = {
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY,
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG,
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX,
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.DESCRIPTION,
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE,
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE]: CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE,
};

/**
 * Lets the "Create a rule" callout appear once Auth has confirmed the edit repeats one the user keeps making.
 *
 * Auth answers with a top-level `suggestNewRuleCreation` rather than an Onyx update, and these edits are queued
 * writes, whose response never reaches the caller. Reading it here is what makes the answer available at all.
 */
const ConfirmMerchantRuleSuggestion: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (!response?.suggestNewRuleCreation) {
            return response;
        }

        const field = FIELD_BY_COMMAND[request.command];
        const transactionID = request.data?.transactionID;
        if (!field || typeof transactionID !== 'string' || !transactionID) {
            return response;
        }

        confirmMerchantRuleSuggestion(transactionID, field);

        return response;
    });

export default ConfirmMerchantRuleSuggestion;
