/* eslint-disable max-classes-per-file */
import {isMatch} from 'date-fns';
import isValid from 'date-fns/isValid';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

class NumberError extends SyntaxError {
    constructor() {
        super('debug.invalidValue', {cause: {expectedValues: 'number | undefined'}});
    }
}

class ArrayError extends SyntaxError {
    constructor(arrayType: string | Record<string, unknown>) {
        super('debug.invalidValue', {
            cause: {
                expectedValues: `[${typeof arrayType === 'object' ? convertToJSON(arrayType) : arrayType}]`,
            },
        });
    }
}

class ObjectError extends SyntaxError {
    constructor(type: Record<string, unknown>) {
        super('debug.invalidValue', {
            cause: {
                expectedValues: `${convertToJSON(type)} | undefined`,
            },
        });
    }
}

type ObjectType = Record<
    string,
    | 'string'
    | 'number'
    | 'object'
    | 'array'
    | 'boolean' // Constant enum
    | ConstantEnum
>;

type ConstantEnum = Record<string, unknown>;

type PropertyTypes = Array<'string' | 'number' | 'object' | 'boolean' | 'undefined'>;

const OPTIONAL_BOOLEAN_STRINGS = ['true', 'false', 'undefined'];

const REPORT_NUMBER_PROPERTIES: Array<keyof Report> = [
    'lastMessageTimestamp',
    'lastReadSequenceNumber',
    'managerID',
    'lastActorAccountID',
    'ownerAccountID',
    'total',
    'unheldTotal',
    'iouReportAmount',
    'nonReimbursableTotal',
] satisfies Array<keyof Report>;

const REPORT_BOOLEAN_PROPERTIES: Array<keyof Report> = [
    'hasOutstandingChildRequest',
    'hasOutstandingChildTask',
    'isOwnPolicyExpenseChat',
    'isPolicyExpenseChat',
    'isPinned',
    'hasParentAccess',
    'isDeletedParentAction',
    'openOnAdminRoom',
    'isOptimisticReport',
    'isWaitingOnBankAccount',
    'isCancelledIOU',
    'isLastMessageDeletedParentAction',
    'isHidden',
    'isChatRoom',
    'isLoadingPrivateNotes',
    'selected',
] satisfies Array<keyof Report>;

const REPORT_DATE_PROPERTIES: Array<keyof Report> = ['lastVisibleActionCreated', 'lastReadCreated', 'lastReadTime', 'lastMentionedTime', 'lastVisibleActionLastModified'] satisfies Array<
    keyof Report
>;

const REPORT_REQUIRED_PROPERTIES: Array<keyof Report> = ['reportID'] satisfies Array<keyof Report>;

const REPORT_ACTION_REQUIRED_PROPERTIES: Array<keyof ReportAction> = ['reportActionID', 'created', 'actionName'] satisfies Array<keyof ReportAction>;

const REPORT_ACTION_NUMBER_PROPERTIES: Array<keyof ReportAction> = [
    'sequenceNumber',
    'actorAccountID',
    'accountID',
    'childCommenterCount',
    'childVisibleActionCount',
    'childManagerAccountID',
    'childOwnerAccountID',
    'childLastActorAccountID',
    'childMoneyRequestCount',
    'delegateAccountID',
    'adminAccountID',
] satisfies Array<keyof ReportAction>;

const REPORT_ACTION_BOOLEAN_PROPERTIES: Array<keyof ReportAction> = [
    'isLoading',
    'automatic',
    'shouldShow',
    'isFirstItem',
    'isAttachmentOnly',
    'isAttachmentWithText',
    'isNewestReportAction',
    'isOptimisticAction',
] satisfies Array<keyof ReportAction>;

const REPORT_ACTION_DATE_PROPERTIES: Array<keyof ReportAction> = ['created', 'lastModified'] satisfies Array<keyof ReportAction>;

let isInFocusMode: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: (priorityMode) => {
        isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    },
});

let allTransactions: OnyxCollection<Transaction> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }

        allTransactions = Object.keys(value)
            .filter((key) => !!value[key])
            .reduce((result: OnyxCollection<Transaction>, key) => {
                if (result) {
                    // eslint-disable-next-line no-param-reassign
                    result[key] = value[key];
                }
                return result;
            }, {});
    },
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }

        allReportActions = actions ?? {};
    },
});

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID;
    },
});

function convertToJSON(data: Record<string | number, unknown>) {
    return JSON.stringify(data, null, 6);
}

function parseJSON(json: string) {
    return JSON.parse(json.replaceAll('\n', '')) as unknown;
}

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
        return convertToJSON(data as Record<string | number, unknown>);
    }

    return String(data);
}
type OnyxDataType = 'number' | 'bigint' | 'object' | 'string' | 'boolean' | 'symbol' | 'function' | 'undefined';

type OnyxData<T extends OnyxDataType> = (T extends 'number' ? number : T extends 'object' ? Record<string, unknown> : T extends 'boolean' ? boolean : string) | null;

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
            onyxData = parseJSON(data) as Record<string, unknown>;
            break;
        case 'boolean':
            onyxData = data === 'true';
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
        return text === convertToJSON(data as Record<string | number, unknown>);
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

/**
 * Validates if a string is a valid representation of a number
 *
 * @param value - string
 */
// eslint-disable-next-line rulesdir/prefer-early-return
function validateNumber(value: string) {
    if (value !== 'undefined' && (value.includes(' ') || value === '' || Number.isNaN(Number(value)))) {
        throw new NumberError();
    }
}

/**
 * Validates if a string is a valid representation of a boolean
 *
 * @param value - string
 */
// eslint-disable-next-line rulesdir/prefer-early-return
function validateBoolean(value: string) {
    if (!OPTIONAL_BOOLEAN_STRINGS.includes(value)) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: OPTIONAL_BOOLEAN_STRINGS.join(' | ')}});
    }
}

/**
 * Validates if a string is a valid representation of a date
 *
 * @param value - string
 */
// eslint-disable-next-line rulesdir/prefer-early-return
function validateDate(value: string) {
    if (value !== 'undefined' && (!isMatch(value, CONST.DATE.FNS_DB_FORMAT_STRING) || !isValid(new Date(value)))) {
        throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: CONST.DATE.FNS_DB_FORMAT_STRING}});
    }
}

/**
 * Validates if a string is a valid representation of an enum value
 *
 * @param value - string
 * @param constEnum - enum
 */
// eslint-disable-next-line rulesdir/prefer-early-return
function validateConstantEnum(value: string, constEnum: ConstantEnum) {
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

/**
 * Validates if a string is a valid representation of an array
 *
 * @param value - string
 * @param arrayType - type of array element
 */
function validateArray(
    value: string,
    arrayType:
        | 'string'
        | 'number'
        | 'boolean'
        // Constant enum
        | ConstantEnum
        // Object
        | Record<
              string,
              | 'string'
              | 'number'
              | 'object'
              | 'boolean'
              | 'array'
              | PropertyTypes
              // Constant enum
              | ConstantEnum
          >,
) {
    if (value === 'undefined') {
        return;
    }

    const array = parseJSON(value) as unknown[];

    if (typeof array !== 'object' || !Array.isArray(array)) {
        throw new ArrayError(arrayType);
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    array.forEach((element) => {
        // Element is an object
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
            // eslint-disable-next-line rulesdir/prefer-early-return
            Object.entries(arrayType).forEach(([key, val]) => {
                const property = element[key as keyof typeof element];
                // Property is a constant enum, so we apply validateConstantEnum
                if (typeof val === 'object' && !Array.isArray(val)) {
                    return validateConstantEnum(property, val as ConstantEnum);
                }
                // Expected property type is array
                if (val === 'array') {
                    // Property type is not array
                    if (!Array.isArray(property)) {
                        throw new ArrayError(arrayType);
                    }
                    return;
                }
                // Property type is not one of the valid types
                if (Array.isArray(val) ? !val.includes(typeof property) : typeof property !== val) {
                    throw new ArrayError(arrayType);
                }
            });
            return;
        }
        // Element is a constant enum
        if (typeof arrayType === 'object') {
            // Element doesn't exist in enum
            if (!Object.values(arrayType).includes(element)) {
                throw new ArrayError(arrayType);
            }
            return;
        }
        // Element is not a valid type
        if (typeof element !== arrayType) {
            throw new ArrayError(arrayType);
        }
    });
}

/**
 * Validates if a string is a valid representation of an object
 *
 * @param value - string
 * @param type - expected object type
 * @param collectionIndexType - type of collection index
 */
function validateObject(value: string, type: ObjectType, collectionIndexType?: 'string' | 'number') {
    if (value === 'undefined') {
        return;
    }

    const expectedType = collectionIndexType
        ? {
              [collectionIndexType]: type,
          }
        : type;

    const object = parseJSON(value) as ObjectType;

    if (typeof object !== 'object' || Array.isArray(object)) {
        throw new ObjectError(expectedType);
    }

    if (collectionIndexType) {
        Object.keys(object).forEach((key) => {
            try {
                if (collectionIndexType === 'number') {
                    validateNumber(key);
                }
            } catch (e) {
                throw new ObjectError(expectedType);
            }
        });
    }

    const tests = collectionIndexType ? (Object.values(object) as unknown as Array<Record<string, 'string' | 'number' | 'object'>>) : [object];

    tests.forEach((test) => {
        if (typeof test !== 'object' || Array.isArray(test)) {
            throw new ObjectError(expectedType);
        }

        // eslint-disable-next-line rulesdir/prefer-early-return
        Object.entries(type).forEach(([key, val]) => {
            // test[key] is a constant enum
            if (typeof val === 'object') {
                return validateConstantEnum(test[key] as string, val);
            }
            if (val === 'array' ? !Array.isArray(test[key]) : typeof test[key] !== val) {
                throw new ObjectError(expectedType);
            }
        });
    });
}

/**
 * Validates if a string is a valid representation of a string
 */
function validateString(value: string) {
    if (value === 'undefined') {
        return;
    }

    try {
        const parsedValue = parseJSON(value);

        if (typeof parsedValue === 'object') {
            throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: 'string | undefined'}});
        }
    } catch (e) {
        // Only propagate error if value is a string representation of an object or array
        if ((e as SyntaxError).cause) {
            throw e;
        }
    }
}

function validateReportDraftProperty(key: keyof Report, value: string) {
    if (REPORT_REQUIRED_PROPERTIES.includes(key) && value === 'undefined') {
        throw SyntaxError('debug.missingValue');
    }
    if (key === 'privateNotes') {
        return validateObject(
            value,
            {
                note: 'string',
            },
            'number',
        );
    }
    if (key === 'permissions') {
        return validateArray(value, CONST.REPORT.PERMISSIONS);
    }
    if (key === 'pendingChatMembers') {
        return validateArray(value, {
            accountID: 'string',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
        });
    }
    if (key === 'participants') {
        return validateObject(
            value,
            {
                hidden: 'boolean',
            },
            'number',
        );
    }
    if (REPORT_NUMBER_PROPERTIES.includes(key)) {
        return validateNumber(value);
    }
    if (REPORT_BOOLEAN_PROPERTIES.includes(key)) {
        return validateBoolean(value);
    }
    if (REPORT_DATE_PROPERTIES.includes(key)) {
        return validateDate(value);
    }
    if (key === 'tripData') {
        return validateObject(value, {
            startDate: 'string',
            endDate: 'string',
            tripID: 'string',
        });
    }
    if (key === 'lastActionType') {
        return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
    }
    if (key === 'writeCapability') {
        return validateConstantEnum(value, CONST.REPORT.WRITE_CAPABILITIES);
    }
    if (key === 'visibility') {
        return validateConstantEnum(value, CONST.REPORT.VISIBILITY);
    }
    if (key === 'stateNum') {
        return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
    }
    if (key === 'statusNum') {
        return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
    }
    if (key === 'notificationPreference') {
        return validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
    }
    if (key === 'chatType') {
        return validateConstantEnum(value, CONST.REPORT.CHAT_TYPE);
    }
    if (key === 'errorFields') {
        return validateObject(value, {});
    }
    if (key === 'pendingFields') {
        return validateObject(value, {});
    }
    if (key === 'visibleChatMemberAccountIDs') {
        return validateArray(value, 'number');
    }
    if (key === 'participantAccountIDs') {
        return validateArray(value, 'number');
    }

    validateString(value);
}

function validateReportActionDraftProperty(key: keyof ReportAction, value: string) {
    if (REPORT_ACTION_REQUIRED_PROPERTIES.includes(key) && value === 'undefined') {
        throw SyntaxError('debug.missingValue');
    }
    if (REPORT_ACTION_NUMBER_PROPERTIES.includes(key)) {
        return validateNumber(value);
    }
    if (REPORT_ACTION_BOOLEAN_PROPERTIES.includes(key)) {
        return validateBoolean(value);
    }
    if (key === 'actionName') {
        return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
    }
    if (key === 'childStatusNum') {
        return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
    }
    if (key === 'childStateNum') {
        return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
    }
    if (key === 'childReportNotificationPreference') {
        return validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
    }
    if (REPORT_ACTION_DATE_PROPERTIES.includes(key)) {
        return validateDate(value);
    }

    if (key === 'whisperedToAccountIDs') {
        return validateArray(value, 'number');
    }
    if (key === 'message') {
        return validateArray(value, {text: 'string', html: ['string', 'undefined'], type: 'string'});
    }
    if (key === 'person') {
        return validateArray(value, {});
    }
    if (key === 'errors') {
        return validateObject(value, {});
    }
    validateString(value);
}

function validateReportActionJSON(json: string) {
    const parsedReportAction = parseJSON(json) as ReportAction;
    // eslint-disable-next-line rulesdir/prefer-early-return
    REPORT_ACTION_REQUIRED_PROPERTIES.forEach((key) => {
        if (parsedReportAction[key] === undefined) {
            throw new SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
        }
    });
    Object.entries(parsedReportAction).forEach(([key, val]) => {
        try {
            if (val !== 'undefined' && REPORT_ACTION_NUMBER_PROPERTIES.includes(key as keyof ReportAction) && typeof val !== 'number') {
                throw new NumberError();
            }
            validateReportActionDraftProperty(key as keyof ReportAction, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw new SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    });
}

const DebugUtils = {
    onyxDataToDraftData,
    onyxDataToString,
    stringToOnyxData,
    compareStringWithOnyxData,
    getNumberOfLinesFromString,
    validateNumber,
    validateBoolean,
    validateDate,
    validateConstantEnum,
    validateArray,
    validateObject,
    validateString,
    validateReportDraftProperty,
    validateReportActionDraftProperty,
    validateReportActionJSON,
    REPORT_ACTION_REQUIRED_PROPERTIES,
    REPORT_REQUIRED_PROPERTIES,
};

export type {ObjectType};

export default DebugUtils;
