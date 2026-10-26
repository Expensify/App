import {getScenarioConfig} from '@components/MultifactorAuthentication/config';

import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {denyTransaction} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';

jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/MultifactorAuthentication'),
    denyTransaction: jest.fn(),
}));

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const TRANSACTION_ID = 'txn-cancel';

const denyTransactionMock = jest.mocked(denyTransaction);
const {onCancel} = getScenarioConfig(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION);

describe('AuthorizeTransaction onCancel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('denies the transaction from the payload', async () => {
        // Given the backend accepts the deny, so the test only checks which transaction gets denied
        denyTransactionMock.mockResolvedValue({httpStatusCode: 200, reason: REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, message: undefined});

        // When the user cancels the authorize-transaction flow
        await onCancel({transactionID: TRANSACTION_ID});

        // Then exactly the transaction under review is denied once, because cancelling a 3DS challenge must decline that payment
        expect(denyTransactionMock).toHaveBeenCalledTimes(1);
        expect(denyTransactionMock).toHaveBeenCalledWith({transactionID: TRANSACTION_ID});
    });

    it('returns the deny result, so a successful deny shows the transaction-denied screen', async () => {
        // Given the backend confirms the transaction was denied
        denyTransactionMock.mockResolvedValue({httpStatusCode: 200, reason: REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, message: undefined});

        // When the user cancels the flow
        const error = await onCancel({transactionID: TRANSACTION_ID});

        // Then the deny response is passed through, because its reason is what picks the transaction-denied outcome screen
        expect(error).toEqual(createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined));
    });

    it.each([
        ['a server error', 500, REASON.SERVER_ERRORS.UNRECOGNIZED],
        ['a network error', 0, REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE],
    ])('returns the deny reason unchanged for %s', async (_, httpStatusCode, reason) => {
        // Given the deny fails with a result that doesn't say whether the transaction was approved or denied
        denyTransactionMock.mockResolvedValue({httpStatusCode, reason, message: undefined});

        // When the user cancels the flow
        const error = await onCancel({transactionID: TRANSACTION_ID});

        // Then the deny's reason is passed through, so the machine can weigh it against the approve result
        expect(error).toEqual(createMFAErrorFromApiResponse(httpStatusCode, reason, undefined));
    });

    it('keeps the already-reviewed reason when the deny arrives after the transaction was approved', async () => {
        // Given the backend rejects the deny because the transaction was already approved
        denyTransactionMock.mockResolvedValue({httpStatusCode: 400, reason: REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED, message: 'Transaction already approved'});

        // When the user cancels the flow
        const error = await onCancel({transactionID: TRANSACTION_ID});

        // Then the already-reviewed reason is kept, because the deny can't tell which approve went through
        expect(error.reason).toBe(REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED);
    });

    it('returns CANCELED without denying when the payload has no transaction', async () => {
        // Given a flow whose payload carries no transaction to deny
        // When the user cancels it
        const error = await onCancel(undefined);

        // Then nothing is denied and the outcome is a plain cancel, because there is no transaction the backend could decline
        expect(denyTransactionMock).not.toHaveBeenCalled();
        expect(error).toEqual(createLocalMFAError(REASON.LOCAL_ERRORS.CANCELED, undefined));
    });
});
