/**
 * Checks how a rejected expense write is split into Sentry issues, so an expected business-rule rejection stays separable
 * from a real failure, and so a rejection is classified from the server's own error-site id before anything weaker.
 * See https://github.com/Expensify/App/issues/106416.
 */
import {WRITE_COMMANDS} from '@libs/API/types';
import {trackExpenseApiError} from '@libs/telemetry/trackExpenseCreationError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({captureMessage: jest.fn(), logger: {info: jest.fn()}}));

const captureMessage = jest.mocked(Sentry.captureMessage);
const loggerInfo = jest.mocked(Sentry.logger.info);

const {EXPENSE_CREATION_ERROR_MESSAGE: SERVER_MESSAGE, EXPENSE_ERROR_UUID: SERVER_UUID, JSON_CODE} = CONST;

/**
 * Response codes a rejection can carry that `JSON_CODE` has no entry for, because the client never acts on them. Reaching
 * one is the point of several tests below, so they are named rather than spelled out.
 */
const SERVER_ONLY_JSON_CODE = {
    UNMAPPED_ROLE: 401,
    UNMAPPED_REPORT: 403,
    UNMAPPED_NOT_FOUND: 404,
};
const {TAGS, EXPENSE_FAILURE_REASON: REASON, EXPENSE_FAILURE_CLASS: FAILURE_CLASS, EXPENSE_ERROR_TYPE: ERROR_TYPE, EXPENSE_REASON_SOURCE: REASON_SOURCE} = CONST.TELEMETRY;

/** The options object a `captureMessage` call carried, for the assertions a matcher cannot express. */
type EventOptions = {level?: string; tags?: Record<string, string>; extra?: Record<string, unknown>; fingerprint?: string[]};

function isEventOptions(context: unknown): context is EventOptions {
    return typeof context === 'object' && context !== null && !Array.isArray(context);
}

function optionsOf(callIndex: number): EventOptions {
    const context = captureMessage.mock.calls[callIndex]?.[1];
    if (!isEventOptions(context)) {
        throw new Error(`expected call ${callIndex} to carry an event options object`);
    }
    return context;
}

/** The tags of an event: the seven keys every expense event carries, plus the server error id when one arrived. */
function expectedTags(reason: string, failureClass: string, reasonSource: string, command: string, jsonCode: string) {
    return {
        [TAGS.EXPENSE_ERROR_TYPE]: ERROR_TYPE.API_ERROR,
        [TAGS.EXPENSE_ERROR_SOURCE]: CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.API_RESPONSE,
        [TAGS.EXPENSE_COMMAND]: command,
        [TAGS.EXPENSE_JSON_CODE]: jsonCode,
        [TAGS.EXPENSE_FAILURE_REASON]: reason,
        [TAGS.EXPENSE_FAILURE_CLASS]: failureClass,
        [TAGS.EXPENSE_REASON_SOURCE]: reasonSource,
    };
}

beforeEach(() => {
    captureMessage.mockClear();
    loggerInfo.mockClear();
});

describe('classification from the server error UUID', () => {
    // All four share one wording, so only the error id separates a closed expense report from a self-DM.
    it.each([
        [SERVER_UUID.EXPENSE_REPORT_CLOSED, REASON.EXPENSE_REPORT_CLOSED],
        [SERVER_UUID.IOU_REPORT_NOT_SUBMITTED, REASON.IOU_REPORT_NOT_SUBMITTED],
        [SERVER_UUID.REPORT_NOT_OPEN, REASON.REPORT_NOT_OPEN],
        [SERVER_UUID.SELF_DM, REASON.SELF_DM],
    ])('separates %s from the report-state rejections it shares a message with', (errorUUID, expectedReason) => {
        // Given a RequestMoney rejection the server worded "New expenses cannot be added to this report."
        // When it is reported with the id of the throw site that worded it that way
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED, errorUUID});

        // Then the reason names that throw site's cause, not the shared wording
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: expectedReason, [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.ERROR_UUID})}),
        );
    });

    it('reads an ownership mismatch as such, despite the message saying permissions', () => {
        // Given the 401 Unauthorized from an ownership, membership or policy-match check, which the API relabels with the
        // word "permissions"
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.TARGET_UNAUTHORIZED, errorUUID: SERVER_UUID.TARGET_UNAUTHORIZED});

        // Then it is named as a wrong or stale target, because the approve-only role is a different rejection entirely
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.TARGET_UNAUTHORIZED})}),
        );
    });

    it('reads a malformed receipt request out of a generic-sounding message', () => {
        // Given the "Cannot pass both receipt and receiptID" throw, whose message the API words as a generic failure
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.SERVER_GENERIC, errorUUID: SERVER_UUID.RECEIPT_AND_RECEIPT_ID});

        // Then the reason is the real cause, and it is not filed as an unexplained server failure
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.RECEIPT_AND_RECEIPT_ID, [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.CLIENT_BUG}),
            }),
        );
    });

    it('classifies a deprecated build by its error id when the response code says otherwise', () => {
        // Given a build the server refuses to serve, reported with 407 by server versions that predate the 426 behavior
        // When it is reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: JSON_CODE.NOT_AUTHENTICATED,
            message: SERVER_MESSAGE.APP_VERSION_DEPRECATED,
            errorUUID: SERVER_UUID.APP_VERSION_DEPRECATED,
        });

        // Then the id wins over the code, so the same condition is one reason rather than two
        expect(loggerInfo).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.APP_VERSION_DEPRECATED, [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.ERROR_UUID}),
        );
    });
});

describe('classification from the message, when there is no UUID', () => {
    // TrackExpense runs no mapping ladder server-side, so none of its rejections carry an error id.
    it.each<[string, string]>([
        [SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED, REASON.REPORT_UNAVAILABLE],
        [SERVER_MESSAGE.TARGET_UNAUTHORIZED, REASON.TARGET_UNAUTHORIZED],
        [SERVER_MESSAGE.REPORT_WRITE_FORBIDDEN, REASON.REPORT_WRITE_FORBIDDEN],
        [SERVER_MESSAGE.SELF_REQUEST, REASON.SELF_REQUEST],
        [SERVER_MESSAGE.INVALID_AMOUNT, REASON.INVALID_AMOUNT],
        [SERVER_MESSAGE.INVALID_ATTENDEE, REASON.INVALID_ATTENDEE],
        [SERVER_MESSAGE.INVALID_ATTENDEE_FORMAT, REASON.INVALID_ATTENDEE],
        [SERVER_MESSAGE.RECEIPT_ALREADY_ATTACHED, REASON.RECEIPT_ALREADY_ATTACHED],
        [SERVER_MESSAGE.CHAT_ALREADY_EXISTS, REASON.CHAT_ALREADY_EXISTS],
        [SERVER_MESSAGE.POLICY_NOT_EXPENSE_ENABLED, REASON.POLICY_NOT_EXPENSE_ENABLED],
        [SERVER_MESSAGE.SERVER_GENERIC, REASON.SERVER_GENERIC],
    ])('names the reason for the mapped message "%s"', (message, expectedReason) => {
        // Given a TrackExpense rejection, which the server passes through with no error id
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: JSON_CODE.EXP_ERROR, message});

        // Then the wording still identifies it, and the event says the match came from the message
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: expectedReason, [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.MESSAGE})}),
        );
    });

    it('names the approve-only role rejection the API passes through unmapped', () => {
        // Given the raw Auth error line for an approve-only member, which reaches us with no error id and its status prefix
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: SERVER_ONLY_JSON_CODE.UNMAPPED_ROLE, message: SERVER_MESSAGE.MEMBER_CANNOT_CREATE_EXPENSES});

        // Then it is its own reason, kept apart from the ownership mismatch that merely mentions permissions
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                level: 'warning',
                tags: expect.objectContaining({
                    [TAGS.EXPENSE_FAILURE_REASON]: REASON.MEMBER_CANNOT_CREATE_EXPENSES,
                    [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.MESSAGE,
                    [TAGS.EXPENSE_JSON_CODE]: String(SERVER_ONLY_JSON_CODE.UNMAPPED_ROLE),
                }),
            }),
        );
    });

    it('names the singular report rejection the API passes through unmapped', () => {
        // Given the singular Auth error line, which the mapping ladder never matches
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: SERVER_ONLY_JSON_CODE.UNMAPPED_REPORT, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_RAW});

        // Then it reads as a report that cannot take the expense, attributed to the wording that told us so
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.REPORT_UNAVAILABLE, [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.MESSAGE}),
            }),
        );
    });

    it('does not guess a cause for a 404, which the server never maps', () => {
        // Given a 404 rejection. Web-Expensify maps one to the report-state message, but no Auth code throws it, so the
        // Sentry 404s are something else entirely
        // When it is reported with no message
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: SERVER_ONLY_JSON_CODE.UNMAPPED_NOT_FOUND});

        // Then it stays unclassified at error level, instead of being filed as a report-state rejection
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                level: 'error',
                tags: expect.objectContaining({
                    [TAGS.EXPENSE_FAILURE_REASON]: REASON.NO_MESSAGE,
                    [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.UNCLASSIFIED,
                    [TAGS.EXPENSE_JSON_CODE]: String(SERVER_ONLY_JSON_CODE.UNMAPPED_NOT_FOUND),
                }),
            }),
        );
    });

    it('builds its tags from constants, not response text', () => {
        // Given a message that arrived carrying an account id and an email, as an unmapped server message could
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: 'Report 123456789 belongs to user@example.com'});

        // Then the tags are exactly the seven we define, none of them built from the message
        expect(optionsOf(0).tags).toStrictEqual(expectedTags(REASON.OTHER, FAILURE_CLASS.UNCLASSIFIED, REASON_SOURCE.NONE, WRITE_COMMANDS.REQUEST_MONEY, String(JSON_CODE.EXP_ERROR)));
    });

    it('forwards an error id we have not mapped, and says so', () => {
        // Given a rejection carrying an error id from a throw site nobody has classified yet
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, errorUUID: 'A1A1A1A1-0000-4000-8000-000000000000'});

        // Then the id still rides on the event, but the reason is not credited to it: that id is the reason we cannot
        // name the cause, and mixing the two would hide new throw sites inside the mapped ones
        expect(optionsOf(0).tags).toStrictEqual({
            ...expectedTags(REASON.NO_MESSAGE, FAILURE_CLASS.UNCLASSIFIED, REASON_SOURCE.UNKNOWN_ERROR_UUID, WRITE_COMMANDS.REQUEST_MONEY, String(JSON_CODE.EXP_ERROR)),
            [TAGS.EXPENSE_ERROR_UUID]: 'A1A1A1A1-0000-4000-8000-000000000000',
        });
    });

    it('reports a response with no message as its own reason', () => {
        // Given a rejection that carried no message and no id we match
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: JSON_CODE.EXP_ERROR});

        // Then it groups apart from rejections carrying an unmapped message, so a missing message is visible on its own
        expect(captureMessage).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.NO_MESSAGE})}));
    });
});

describe('grouping', () => {
    it('splits one command and code into one issue per reason', () => {
        // Given two RequestMoney rejections sharing command, code and message but differing in throw site, as in APP-5WY
        // When both are reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: JSON_CODE.EXP_ERROR,
            message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED,
            errorUUID: SERVER_UUID.EXPENSE_REPORT_CLOSED,
        });
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED, errorUUID: SERVER_UUID.SELF_DM});

        // Then they fingerprint apart, which is what a shared message alone could never do
        expect(optionsOf(0).fingerprint).toEqual([ERROR_TYPE.API_ERROR, WRITE_COMMANDS.REQUEST_MONEY, String(JSON_CODE.EXP_ERROR), REASON.EXPENSE_REPORT_CLOSED]);
        expect(optionsOf(1).fingerprint).toEqual([ERROR_TYPE.API_ERROR, WRITE_COMMANDS.REQUEST_MONEY, String(JSON_CODE.EXP_ERROR), REASON.SELF_DM]);
    });

    it('names the command, code and reason in the title', () => {
        // Given a rejection grouped by fingerprint, where the title is for reading, not grouping
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then the title still says which command, code and reason it is
        expect(captureMessage).toHaveBeenCalledWith(`Expense API Error: ${WRITE_COMMANDS.TRACK_EXPENSE} returned ${JSON_CODE.EXP_ERROR} (${REASON.REPORT_UNAVAILABLE})`, expect.anything());
    });

    it('tags the server error id when the response carries one', () => {
        // Given a rejection carrying the id of the throw site that produced it
        // When it is reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: JSON_CODE.EXP_ERROR,
            message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED,
            errorUUID: SERVER_UUID.EXPENSE_REPORT_CLOSED,
        });

        // Then it rides along with the rest, so a reason can be traced back to the server code that threw it
        expect(optionsOf(0).tags).toStrictEqual({
            ...expectedTags(REASON.EXPENSE_REPORT_CLOSED, FAILURE_CLASS.EXPECTED, REASON_SOURCE.ERROR_UUID, WRITE_COMMANDS.REQUEST_MONEY, String(JSON_CODE.EXP_ERROR)),
            [TAGS.EXPENSE_ERROR_UUID]: SERVER_UUID.EXPENSE_REPORT_CLOSED,
        });
    });

    it('omits the server error id tag when the response has none', () => {
        // Given a rejection the server passed through unmapped, so it carries no id
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then the tag is left out rather than sent empty, which would split the issue by an empty value
        expect(optionsOf(0).tags).not.toHaveProperty(TAGS.EXPENSE_ERROR_UUID);
    });
});

describe('severity and routing', () => {
    it('reports an expected business-rule rejection as a warning', () => {
        // Given a rejection for a rule the server enforces by design
        // When it is reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: JSON_CODE.EXP_ERROR,
            message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED,
            errorUUID: SERVER_UUID.EXPENSE_REPORT_CLOSED,
        });

        // Then it is classed and leveled as expected, so it does not stand out as a failure would
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({level: 'warning', tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.EXPECTED})}),
        );
    });

    // Each of these is the server refusing a request we built: NewDot has no `receiptID` param to send alongside a receipt
    // file, we serialize the attendee JSON ourselves and omit `email` when it is empty, and we put a payer email on a
    // NewDot expense the server says must not carry one. They belong in the issue stream at error level, unlike a business
    // rule about the user's situation.
    it.each<[string, Record<string, string>]>([
        [REASON.RECEIPT_AND_RECEIPT_ID, {errorUUID: SERVER_UUID.RECEIPT_AND_RECEIPT_ID, message: SERVER_MESSAGE.SERVER_GENERIC}],
        [REASON.PAYER_NOT_ALLOWED, {errorUUID: SERVER_UUID.PAYER_NOT_ALLOWED, message: SERVER_MESSAGE.SERVER_GENERIC}],
        [REASON.INVALID_ATTENDEE, {message: SERVER_MESSAGE.INVALID_ATTENDEE_FORMAT}],
    ])('reports the client-built rejection %s at error level', (expectedReason, response) => {
        // Given a rejection of a request shape our own code produces
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, ...response});

        // Then it is classed as ours and leveled as a failure, so it is not filed with the rules that worked correctly
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                level: 'error',
                tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: expectedReason, [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.CLIENT_BUG}),
            }),
        );
    });

    // An empty amount on a P2P request is the server refusing a value, not a request shape: NewDot lets a user enter $0
    // deliberately, so this rule fires on what the user typed.
    it('reports a rejected amount as an expected rule, not as our bug', () => {
        // Given the 405 invalid amount, thrown when a P2P request arrives with no amount and nothing to scan
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.INVALID_AMOUNT});

        // Then it stays a warning, so the amount rule does not sit in the same issue class as a malformed payload
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                level: 'warning',
                tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.INVALID_AMOUNT, [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.EXPECTED}),
            }),
        );
    });

    it.each<[string, string | undefined]>([
        ['an unmapped message', 'A message nobody has classified'],
        ['a message with no detail beyond the failure', SERVER_MESSAGE.SERVER_GENERIC],
        ['no message at all', undefined],
    ])('reports %s at error level', (_label, message) => {
        // Given a rejection we cannot yet tell apart from a real failure
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.EXP_ERROR, message});

        // Then it stays at error level and in the issue stream until someone classifies it
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({level: 'error', tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.UNCLASSIFIED})}),
        );
    });

    // A deprecated build is thrown before the command runs, so the only text it carries is its own. An expired session
    // carries nothing at all, because the API never reached a command that would have produced some.
    it.each<[number, string | undefined, string, string]>([
        [JSON_CODE.UPDATE_REQUIRED, SERVER_MESSAGE.APP_VERSION_DEPRECATED, REASON.APP_VERSION_DEPRECATED, REASON_SOURCE.MESSAGE],
        [JSON_CODE.NOT_AUTHENTICATED, undefined, REASON.NOT_AUTHENTICATED, REASON_SOURCE.JSON_CODE_ONLY],
    ])('sends jsonCode %s to Sentry Logs instead of the issue stream', (jsonCode, message, expectedReason, expectedSource) => {
        // Given a rejection the server raises about the client build or the session rather than the expense
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode, message});

        // Then the event is a log rather than an issue: a deprecated build fires for every user still on an old version each
        // time the minimum moves, which would flood the issue stream
        expect(captureMessage).not.toHaveBeenCalled();
        expect(loggerInfo).toHaveBeenCalledWith(
            `[Expense] ${WRITE_COMMANDS.REQUEST_MONEY} returned ${jsonCode} (${expectedReason})`,
            expect.objectContaining({
                [TAGS.EXPENSE_FAILURE_REASON]: expectedReason,
                [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.NOT_OUR_PROBLEM,
                [TAGS.EXPENSE_REASON_SOURCE]: expectedSource,
            }),
        );
    });

    it('prefers the server error id over a message it could have matched', () => {
        // Given a deprecated-build response that also carried the message a command would have produced
        // When it is reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: JSON_CODE.UPDATE_REQUIRED,
            message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED,
            errorUUID: SERVER_UUID.APP_VERSION_DEPRECATED,
        });

        // Then the id decides, because the message arrived attached to something else entirely
        expect(loggerInfo).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.APP_VERSION_DEPRECATED}));
    });

    it('prefers a message over a response code it could also have matched', () => {
        // Given the same pair with no id, so the weaker signals decide
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.UPDATE_REQUIRED, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then the message wins, and the event says so: a message match is more specific than a status code
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({tags: expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.REPORT_UNAVAILABLE, [TAGS.EXPENSE_REASON_SOURCE]: REASON_SOURCE.MESSAGE})}),
        );
    });

    it('classifies a string response code by its number', () => {
        // Given a response whose jsonCode arrived as text, which the response type allows
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: String(JSON_CODE.UPDATE_REQUIRED)});

        // Then it is still read as a deprecated build, rather than landing in the catch-all bucket at error level
        expect(loggerInfo).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({[TAGS.EXPENSE_FAILURE_REASON]: REASON.APP_VERSION_DEPRECATED}));
    });

    it('falls back to the message for a response code that is not a number', () => {
        // Given a code the client invents rather than the server sending it, the way UNABLE_TO_RETRY arrives
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: JSON_CODE.UNABLE_TO_RETRY, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then the message still classifies it, so a code that cannot be read as a number costs nothing but the code tag
        expect(captureMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                level: 'warning',
                tags: expect.objectContaining({[TAGS.EXPENSE_JSON_CODE]: JSON_CODE.UNABLE_TO_RETRY, [TAGS.EXPENSE_FAILURE_REASON]: REASON.REPORT_UNAVAILABLE}),
            }),
        );
    });
});

describe('which responses get reported', () => {
    it('ignores a command that creates no expense', () => {
        // Given a rejected write unrelated to expense creation
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.ADD_COMMENT, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then nothing is sent anywhere, so expense telemetry stays about expenses
        expect(captureMessage).not.toHaveBeenCalled();
        expect(loggerInfo).not.toHaveBeenCalled();
    });

    it('keeps a possible lost expense in the issue stream at error level', () => {
        // Given an OpenReport failure naming the transaction that could not be attached, carrying a reason that would
        // otherwise be routed to logs
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.OPEN_REPORT, jsonCode: JSON_CODE.NOT_AUTHENTICATED, requestData: {transactionID: 'ABC123'}});

        // Then it is an issue at error level despite the reason, because a possibly lost expense is a real failure
        expect(loggerInfo).not.toHaveBeenCalled();
        expect(captureMessage).toHaveBeenCalledWith(
            expect.stringContaining('possible lost expense'),
            expect.objectContaining({
                level: 'error',
                tags: expect.objectContaining({[TAGS.EXPENSE_ERROR_TYPE]: ERROR_TYPE.OPEN_REPORT_FAILED, [TAGS.EXPENSE_FAILURE_REASON]: REASON.NOT_AUTHENTICATED}),
            }),
        );
    });

    it('sends an OpenReport failure caused by a deprecated build to Sentry Logs', () => {
        // Given an OpenReport that failed because the server refuses to serve this build, which it decides before the
        // command runs, so no expense was ever in flight
        // When it is reported
        trackExpenseApiError({
            command: WRITE_COMMANDS.OPEN_REPORT,
            jsonCode: JSON_CODE.UPDATE_REQUIRED,
            message: SERVER_MESSAGE.APP_VERSION_DEPRECATED,
            errorUUID: SERVER_UUID.APP_VERSION_DEPRECATED,
            requestData: {transactionID: 'ABC123'},
        });

        // Then it is a log, not an error issue: the lost-expense exemption is for rejections that could have dropped
        // something, and this one could not have
        expect(captureMessage).not.toHaveBeenCalled();
        expect(loggerInfo).toHaveBeenCalledWith(
            `[Expense] ${WRITE_COMMANDS.OPEN_REPORT} returned ${JSON_CODE.UPDATE_REQUIRED} (${REASON.APP_VERSION_DEPRECATED})`,
            expect.objectContaining({[TAGS.EXPENSE_ERROR_TYPE]: ERROR_TYPE.OPEN_REPORT_FAILED, [TAGS.EXPENSE_FAILURE_CLASS]: FAILURE_CLASS.NOT_OUR_PROBLEM}),
        );
    });

    it('ignores an OpenReport failure with no transaction', () => {
        // Given an OpenReport failure that cannot have lost an expense, because no transaction was in flight
        // When it is reported
        trackExpenseApiError({command: WRITE_COMMANDS.OPEN_REPORT, jsonCode: JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED});

        // Then nothing is sent, as it was before
        expect(captureMessage).not.toHaveBeenCalled();
    });
});
