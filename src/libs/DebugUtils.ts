import {isMatch} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Note, Participants, PendingChatMember} from '@src/types/onyx/Report';

const OPTIONAL_BOOLEAN_STRINGS = ['true', 'false', 'undefined'];

/**
 * Converts onyx data into string representation
 *
 * @param data - data to be converted into string
 * @returns converted data
 */
function onyxDataToString(data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return 'undefined';
    }

    if (typeof data === 'object') {
        return JSON.stringify(data, null, 6);
    }

    return String(data);
}
type OnyxDataType = 'number' | 'bigint' | 'object' | 'string' | 'boolean' | 'symbol' | 'function' | 'undefined';

type OnyxData<T extends OnyxDataType> = (T extends 'number' ? number : T extends 'object' ? Record<string, unknown> : T extends 'string' ? string : boolean) | null;

/**
 * Converted strings into the expected onyx data type
 *
 * @param data - string representation of the data is going to be converted
 * @param type - expected type
 * @returns conversion result of data into the expected type
 * @throws {SyntaxError} if type is object but the provided string does not represent an object
 */
function stringToOnyxData<T extends OnyxDataType = 'string'>(data: string, type?: T): OnyxData<T> {
    let onyxData;

    switch (type) {
        case 'number':
            onyxData = Number(data);
            break;
        case 'bigint':
            onyxData = BigInt(data);
            break;
        case 'object':
            onyxData = JSON.parse(data.replaceAll('\n', '')) as Record<string, unknown>;
            break;
        case 'boolean':
            onyxData = data === 'true';
            break;
        case 'symbol':
            onyxData = Symbol(data);
            break;
        case 'undefined':
            onyxData = null;
            break;
        default:
            onyxData = data;
    }

    return onyxData as OnyxData<T>;
}

/**
 * Compares string representation of onyx data with the original data, using type conversion
 *
 * @param text - string representation
 * @param data - original data
 * @returns whether or not the string representation is equal to the original data
 */
function compareStringWithOnyxData(text: string, data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return text === 'undefined';
    }

    if (typeof data === 'object') {
        return text === JSON.stringify(data, null, 6);
    }

    return text === String(data);
}

/**
 * Determines the number of lines needed to display the data
 *
 * @param data - string representation
 * @returns number of lines needed to display the data
 */
function getNumberOfLinesFromString(data: string) {
    return data.split('\n').length || 1;
}

/**
 * Converts every value from an onyx data object into it's string representation, to be used as draft data
 *
 * @param data - onyx data object
 * @returns converted data object
 */
function onyxDataToDraftData(data: OnyxEntry<Record<string, unknown>>) {
    return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [key, onyxDataToString(value)]));
}

// eslint-disable-next-line rulesdir/prefer-early-return
function validateNumber(value: string) {
    if (value !== 'undefined' && (value.includes(' ') || value === '' || Number.isNaN(Number(value)))) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: 'number | undefined'}});
    }
}

// eslint-disable-next-line rulesdir/prefer-early-return
function validateBoolean(value: string) {
    if (!OPTIONAL_BOOLEAN_STRINGS.includes(value)) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: OPTIONAL_BOOLEAN_STRINGS.join(' | ')}});
    }
}

// eslint-disable-next-line rulesdir/prefer-early-return
function validateDate(value: string) {
    if (!isMatch(value, CONST.DATE.FNS_DB_FORMAT_STRING)) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: CONST.DATE.FNS_DB_FORMAT_STRING}});
    }
}

// eslint-disable-next-line rulesdir/prefer-early-return
function validateConstantEnum(value: string, constEnum: Record<string, unknown>) {
    const enumValues = Object.values(constEnum).flatMap((val) => {
        if (val && typeof val === 'object') {
            return Object.values(val).map(String);
        }
        return String(val);
    });
    if (value !== 'undefined' && (value === '' || !enumValues.includes(value))) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: `${enumValues.join(' | ')} | undefined`}});
    }
}

function validateArray(value: string, arrayType: 'string' | 'number' | Record<string | number, 'string' | 'number' | 'object'>) {
    const array = JSON.parse(value.replaceAll('\n', '')) as unknown[];
    const errorCause = {
        cause: {
            expectedValues: `[${typeof arrayType === 'object' ? JSON.stringify(arrayType) : arrayType}]`,
        },
    };

    if (!Array.isArray(array)) {
        throw new SyntaxError('debug.invalidValue', errorCause);
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    array.forEach((element) => {
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
            // eslint-disable-next-line rulesdir/prefer-early-return
            Object.entries(arrayType).forEach(([key, val]) => {
                if (typeof element[key as keyof typeof element] !== val) {
                    throw new SyntaxError('debug.invalidValue', errorCause);
                }
            });
        } else if (typeof element !== arrayType) {
            throw new SyntaxError('debug.invalidValue', errorCause);
        }
    });
}

function validateObject(value: string, type: Record<string | number, 'string' | 'number' | 'object'>) {
    const object = JSON.parse(value.replaceAll('\n', '')) as Record<string | number, 'string' | 'number' | 'object'>;

    if (Array.isArray(object)) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: `${JSON.stringify(type)} | undefined`}});
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    Object.entries(type).forEach(([key, val]) => {
        if (typeof object[key] !== val) {
            throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: `${JSON.stringify(type)} | undefined`}});
        }
    });
}

function validateReportDraftProperty(key: keyof Report, value: string) {
    switch (key) {
        case 'privateNotes': {
            const privateNotes = JSON.parse(value.replaceAll('\n', '')) as Record<number, Note>;
            if (Array.isArray(privateNotes)) {
                throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: '{ "number": { "note": "string" } }'}});
            }
            // eslint-disable-next-line rulesdir/prefer-early-return
            Object.entries(privateNotes).forEach(([accountID, {note}]) => {
                if (accountID.includes(' ') || accountID === '' || Number.isNaN(Number(accountID)) || Array.isArray(note) || typeof note !== 'string') {
                    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: '{ "number": { "note": "string" } }'}});
                }
            });
            break;
        }
        case 'lastMessageTimestamp':
        case 'lastReadSequenceNumber':
        case 'managerID':
        case 'lastActorAccountID':
        case 'ownerAccountID':
        case 'total':
        case 'unheldTotal':
        case 'iouReportAmount':
        case 'nonReimbursableTotal':
            validateNumber(value);
            break;
        case 'lastActionType':
            validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
            break;
        case 'permissions': {
            const permissions = JSON.parse(value.replaceAll('\n', '')) as Array<ValueOf<typeof CONST.REPORT.PERMISSIONS>>;
            if (!Array.isArray(permissions)) {
                throw new SyntaxError('debug.invalidValue', {
                    cause: {expectedValues: `[${Object.values(CONST.REPORT.PERMISSIONS).join(' | ')}] | undefined`},
                });
            }
            // eslint-disable-next-line rulesdir/prefer-early-return
            permissions.forEach((permission) => {
                if (!Object.values(CONST.REPORT.PERMISSIONS).includes(permission)) {
                    throw new SyntaxError('debug.invalidValue', {
                        cause: {expectedValues: `[${Object.values(CONST.REPORT.PERMISSIONS).join(' | ')}] | undefined`},
                    });
                }
            });
            break;
        }
        case 'writeCapability':
            validateConstantEnum(value, CONST.REPORT.WRITE_CAPABILITIES);
            break;
        case 'visibility':
            validateConstantEnum(value, CONST.REPORT.VISIBILITY);
            break;
        case 'stateNum':
            validateConstantEnum(value, CONST.REPORT.STATE_NUM);
            break;
        case 'statusNum':
            validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
            break;
        case 'pendingChatMembers': {
            const pendingChatMembers = JSON.parse(value.replaceAll('\n', '')) as PendingChatMember[];
            if (!Array.isArray(pendingChatMembers)) {
                throw new SyntaxError('debug.invalidValue', {
                    cause: {expectedValues: `[{ "accountID": string, pendingAction: ${Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION).join(' | ')} }]`},
                });
            }
            // eslint-disable-next-line rulesdir/prefer-early-return
            pendingChatMembers.forEach(({accountID, pendingAction}) => {
                if (accountID.includes(' ') || accountID === '' || ![...Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION), null].includes(pendingAction)) {
                    throw new SyntaxError('debug.invalidValue', {
                        cause: {expectedValues: `[{ "accountID": string, pendingAction: ${Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION).join(' | ')} }]`},
                    });
                }
            });
            break;
        }
        case 'participants': {
            const participants = JSON.parse(value.replaceAll('\n', '')) as Participants;
            if (Array.isArray(participants)) {
                throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: '{ "number": { "isHidden": true | false | undefined, "role": "admin" | "member" | undefined } }'}});
            }
            // eslint-disable-next-line rulesdir/prefer-early-return
            Object.entries(participants).forEach(([accountID, participant]) => {
                if (
                    accountID.includes(' ') ||
                    accountID === '' ||
                    Number.isNaN(Number(accountID)) ||
                    Array.isArray(participant) ||
                    ![true, false, undefined].includes(participant.hidden) ||
                    !['admin', 'member', undefined].includes(participant.role)
                ) {
                    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: '{ "number": { "hidden": true | false | undefined, "role": "admin" | "member" | undefined } }'}});
                }
            });
            break;
        }
        case 'notificationPreference':
            validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
            break;
        case 'chatType':
            validateConstantEnum(value, CONST.REPORT.CHAT_TYPE);
            break;
        case 'lastVisibleActionCreated':
        case 'lastReadCreated':
        case 'lastReadTime':
        case 'lastMentionedTime':
        case 'lastVisibleActionLastModified':
            validateDate(value);
            break;
        case 'hasOutstandingChildRequest':
        case 'hasOutstandingChildTask':
        case 'isOwnPolicyExpenseChat':
        case 'isPolicyExpenseChat':
        case 'isPinned':
        case 'hasParentAccess':
        case 'isDeletedParentAction':
        case 'openOnAdminRoom':
        case 'isOptimisticReport':
        case 'isWaitingOnBankAccount':
        case 'isCancelledIOU':
        case 'isLastMessageDeletedParentAction':
        case 'isHidden':
        case 'isChatRoom':
        case 'isLoadingPrivateNotes':
        case 'selected':
            validateBoolean(value);
            break;
        case 'tripData':
            validateObject(value, {startDate: 'string', endDate: 'string', tripID: 'string'});
            break;
        default:
    }
}

function validateReportActionDraftProperty(key: keyof ReportAction, value: string) {
    switch (key) {
        case 'actionName':
            validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
            break;
        case 'childStatusNum':
            validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
            break;
        case 'childStateNum':
            validateConstantEnum(value, CONST.REPORT.STATE_NUM);
            break;
        case 'childReportNotificationPreference':
            validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
            break;
        case 'sequenceNumber':
        case 'actorAccountID':
        case 'accountID':
        case 'childCommenterCount':
        case 'childVisibleActionCount':
        case 'childManagerAccountID':
        case 'childOwnerAccountID':
        case 'childLastActorAccountID':
        case 'childMoneyRequestCount':
        case 'delegateAccountID':
        case 'adminAccountID':
            validateNumber(value);
            break;
        case 'isLoading':
        case 'automatic':
        case 'shouldShow':
        case 'isFirstItem':
        case 'isAttachmentOnly':
        case 'isAttachmentWithText':
        case 'isNewestReportAction':
        case 'isOptimisticAction':
            validateBoolean(value);
            break;
        case 'created':
            validateDate(value);
            break;
        case 'whisperedToAccountIDs':
            validateArray(value, 'number');
            break;
        default:
    }
}

function validateReportActionJSON(json: string) {
    const parsedReportAction = JSON.parse(json.replaceAll('\n', '')) as ReportAction;
    // eslint-disable-next-line rulesdir/prefer-early-return
    ['reportID', 'reportActionID', 'created', 'actionName'].forEach((key) => {
        if (parsedReportAction[key as keyof ReportAction] === undefined) {
            throw SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
        }
    });
    Object.entries(parsedReportAction).forEach(([key, val]) => {
        try {
            validateReportActionDraftProperty(key as keyof ReportAction, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    });
}

const DebugUtils = {
    onyxDataToDraftData,
    onyxDataToString,
    stringToOnyxData,
    compareStringWithOnyxData,
    getNumberOfLinesFromString,
    validateReportDraftProperty,
    validateReportActionDraftProperty,
    validateReportActionJSON,
};

export default DebugUtils;
