import {WRITE_COMMANDS} from '@libs/API/types';
import ConfirmMerchantRuleSuggestion from '@libs/Middleware/ConfirmMerchantRuleSuggestion';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestionConfirmation} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TRANSACTION_ID = '1234567890';
const OTHER_TRANSACTION_ID = '9999';
const REPORT_ID = '555';

/** The six edits Auth counts towards a merchant rule, paired with the field each one records. */
const EDIT_COMMANDS: Array<[string, MerchantRuleSuggestionField]> = [
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY],
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG],
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX],
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.DESCRIPTION],
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE],
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE],
];

function buildRequest(command: string, transactionID: unknown = TRANSACTION_ID): Request<OnyxKey> {
    return {command, data: {transactionID}};
}

/** Its own builder rather than `buildRequest(command, undefined)`, which would fall back to the default expense. */
function buildRequestWithoutTransactionID(command: string): Request<OnyxKey> {
    return {command, data: {}};
}

function buildResponse(suggestNewRuleCreation?: boolean): Response<OnyxKey> {
    return {jsonCode: 200, suggestNewRuleCreation};
}

/** The record an edit leaves behind before any response has landed. */
function seedRecordedEdit(field: MerchantRuleSuggestionField) {
    return Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        reportIDs: {[TRANSACTION_ID]: REPORT_ID},
        editedFields: {[TRANSACTION_ID]: {[field]: true}},
    });
}

function getConfirmation() {
    return getOnyxValue(ONYXKEYS.MERCHANT_RULE_SUGGESTION_CONFIRMATION) as Promise<MerchantRuleSuggestionConfirmation | undefined>;
}

describe('ConfirmMerchantRuleSuggestion middleware', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test.each(EDIT_COMMANDS)('confirms the %s edit against the field it recorded', async (command, field) => {
        // Given a recorded edit of that field, waiting on its queued write
        await seedRecordedEdit(field);

        // When the response says the same merchant keeps being given this value
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(true)), buildRequest(command), false);
        await waitForBatchedUpdates();

        // Then that one field is confirmed, and the expense becomes the one offering
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields?.[TRANSACTION_ID]).toEqual({[field]: true});
        expect(confirmation?.transactionID).toBe(TRANSACTION_ID);
    });

    it('withdraws a confirmation when a later response says no', async () => {
        // Given a field already confirmed by an earlier edit, then edited again so a second write is in flight
        await seedRecordedEdit(CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY);
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(true)), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false);
        await waitForBatchedUpdates();

        // When the second edit's response says this value is not a repeat
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(false)), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false);
        await waitForBatchedUpdates();

        // Then the earlier confirmation no longer stands in for the value the expense now holds
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields?.[TRANSACTION_ID]?.category).toBeUndefined();
    });

    it('leaves the fields of other expenses alone', async () => {
        // Given a confirmed edit on one expense
        await seedRecordedEdit(CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY);
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(true)), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false);
        await waitForBatchedUpdates();

        // When a response lands for a different expense
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(false)), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, OTHER_TRANSACTION_ID), false);
        await waitForBatchedUpdates();

        // Then the first expense keeps what it earned, since a verdict speaks only for the edit that asked for it
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields?.[TRANSACTION_ID]?.category).toBe(true);
    });

    it('records nothing for a command that cannot lead to a rule', async () => {
        // Given an edit of a field no merchant rule governs
        await seedRecordedEdit(CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY);

        // When its response carries a confirmation anyway
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(true)), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT), false);
        await waitForBatchedUpdates();

        // Then nothing is confirmed, because no field maps to that command
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields).toBeUndefined();
        expect(confirmation?.transactionID).toBeUndefined();
    });

    it('records nothing when the request names no expense', async () => {
        // Given an edit command whose request carries no transaction ID, which is what a malformed queue entry reads like
        await seedRecordedEdit(CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY);

        // When its response arrives
        await ConfirmMerchantRuleSuggestion(Promise.resolve(buildResponse(true)), buildRequestWithoutTransactionID(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false);
        await waitForBatchedUpdates();

        // Then there is nothing to key the verdict by, so nothing is written
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields).toBeUndefined();
    });

    it('records nothing when the request never got a response', async () => {
        // Given an edit whose write resolved without a response, which is how an unsent queued request reads
        await seedRecordedEdit(CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY);

        // When the middleware runs on it
        await ConfirmMerchantRuleSuggestion(Promise.resolve(undefined), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false);
        await waitForBatchedUpdates();

        // Then no verdict is recorded, since the server has not given one
        const confirmation = await getConfirmation();
        expect(confirmation?.confirmedFields).toBeUndefined();
    });

    it('passes the response through unchanged as the middleware result', async () => {
        // Given any response at all
        const response = buildResponse(true);

        // When the middleware handles it
        // Then it hands the same object on, so the middlewares after it see what the server sent
        await expect(ConfirmMerchantRuleSuggestion(Promise.resolve(response), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY), false)).resolves.toBe(response);
    });
});
