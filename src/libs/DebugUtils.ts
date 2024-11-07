/* eslint-disable default-case */

/* eslint-disable max-classes-per-file */
import {isMatch, isValid} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import SidebarUtils from './SidebarUtils';
import * as TransactionUtils from './TransactionUtils';

class NumberError extends SyntaxError {
    constructor() {
        super('debug.invalidValue', {cause: {expectedValues: 'number | undefined | ""'}});
    }
}

class ArrayError extends SyntaxError {
    constructor(arrayType: string | Record<string, unknown>) {
        super('debug.invalidValue', {
            cause: {
                expectedValues: `[${typeof arrayType === 'object' ? stringifyJSON(arrayType) : arrayType}]`,
            },
        });
    }
}

class ObjectError extends SyntaxError {
    constructor(type: Record<string, unknown>) {
        super('debug.invalidValue', {
            cause: {
                expectedValues: `${stringifyJSON(type)} | undefined | ''`,
            },
        });
    }
}

type ObjectType<T extends Record<string, unknown>> = Record<keyof T, 'string' | 'number' | 'object' | 'array' | 'boolean' | ConstantEnum>;

type ConstantEnum = Record<string, string | number | boolean | Record<string, string | number | boolean>>;

type PropertyTypes = Array<'string' | 'number' | 'object' | 'boolean' | 'undefined'>;

type ArrayTypeFromOnyxDefinition<T> = T extends unknown[] ? NonNullable<T[number]> : never;

type ArrayElement<TOnyx extends Record<string, unknown>, K extends keyof TOnyx> = ArrayTypeFromOnyxDefinition<Required<TOnyx>[K]>;

type KeysOfUnion<T> = T extends T ? keyof T : never;

type ObjectTypeFromOnyxDefinition<T, TCollectionKey extends string | number | undefined = undefined> = T extends Record<string | number, infer ValueType>
    ? TCollectionKey extends string | number
        ? {[ValueTypeKey in KeysOfUnion<ValueType>]: ValueType[ValueTypeKey]}
        : {[ElementKey in KeysOfUnion<T>]: T[ElementKey]}
    : never;

type ObjectElement<TOnyx extends Record<string, unknown>, K extends keyof TOnyx, TCollectionKey extends string | number | undefined = undefined> = ObjectTypeFromOnyxDefinition<
    TOnyx[K],
    TCollectionKey
>;

const OPTIONAL_BOOLEAN_STRINGS = ['true', 'false', 'undefined'];

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
    'reportActionTimestamp',
    'timestamp',
] satisfies Array<keyof ReportAction>;

const TRANSACTION_REQUIRED_PROPERTIES: Array<keyof Transaction> = ['transactionID', 'reportID', 'amount', 'created', 'currency', 'merchant'] satisfies Array<keyof Transaction>;

const TRANSACTION_VIOLATION_REQUIRED_PROPERTIES: Array<keyof TransactionViolation> = ['type', 'name'] satisfies Array<keyof TransactionViolation>;

let isInFocusMode: OnyxEntry<boolean>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: (priorityMode) => {
        isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    },
});

let policies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        policies = value;
    },
});

let transactionViolations: OnyxCollection<TransactionViolation[]>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        transactionViolations = value;
    },
});

let betas: OnyxEntry<Beta[]>;
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: (value) => {
        betas = value;
    },
});

function stringifyJSON(data: Record<string, unknown>) {
    return JSON.stringify(data, null, 6);
}

function parseJSON(json: string) {
    return JSON.parse(json.replaceAll('\n', '')) as unknown;
}

/**
 * Converts onyx data into string representation.
 *
 * @param data - data to be converted into string
 * @returns converted data
 */
function onyxDataToString(data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return 'undefined';
    }

    if (typeof data === 'object') {
        return stringifyJSON(data as Record<string, unknown>);
    }

    return String(data);
}

type OnyxDataType = 'number' | 'object' | 'string' | 'boolean' | 'undefined';

type OnyxData<T extends OnyxDataType> = (T extends 'number' ? number : T extends 'object' ? Record<string, unknown> : T extends 'boolean' ? boolean : string) | null;

/**
 * Converted strings into the expected onyx data type.
 *
 * @param data - string representation of the data is going to be converted
 * @param type - expected type
 * @returns conversion result of data into the expected type
 * @throws {SyntaxError} if type is object but the provided string does not represent an object
 */
function stringToOnyxData<T extends OnyxDataType = 'string'>(data: string, type?: T): OnyxData<T> {
    if (isEmptyValue(data)) {
        return data as OnyxData<T>;
    }

    let onyxData;

    switch (type) {
        case 'number':
            onyxData = Number(data);
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
        return text === stringifyJSON(data as Record<string, unknown>);
    }

    return text === String(data);
}

/**
 * Determines the number of lines needed to display the data.
 *
 * @param data - string representation
 * @returns number of lines needed to display the data
 */
function getNumberOfLinesFromString(data: string) {
    return data.split('\n').length || 1;
}

/**
 * Converts every value from an onyx data object into it's string representation, to be used as draft data.
 *
 * @param data - onyx data object
 * @returns converted data object
 */
function onyxDataToDraftData(data: OnyxEntry<Record<string, unknown>>) {
    return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [key, onyxDataToString(value)]));
}

/**
 * Whether a string representation is an empty value
 *
 * @param value - string representantion
 * @returns whether the value is an empty value
 */
function isEmptyValue(value: string): boolean {
    switch (value) {
        case 'undefined':
        case 'null':
        case '':
            return true;
        default:
            return false;
    }
}

/**
 * Validates if a string is a valid representation of a number.
 */
function validateNumber(value: string) {
    if (isEmptyValue(value) || (!value.includes(' ') && !Number.isNaN(Number(value)))) {
        return;
    }

    throw new NumberError();
}

/**
 * Validates if a string is a valid representation of a boolean.
 */
function validateBoolean(value: string) {
    if (OPTIONAL_BOOLEAN_STRINGS.includes(value)) {
        return;
    }

    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: OPTIONAL_BOOLEAN_STRINGS.join(' | ')}});
}

/**
 * Validates if a string is a valid representation of a date.
 */
function validateDate(value: string) {
    if (isEmptyValue(value) || ((isMatch(value, CONST.DATE.FNS_DB_FORMAT_STRING) || isMatch(value, CONST.DATE.FNS_FORMAT_STRING)) && isValid(new Date(value)))) {
        return;
    }

    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: CONST.DATE.FNS_DB_FORMAT_STRING}});
}

/**
 * Validates if a string is a valid representation of an enum value.
 */
function validateConstantEnum(value: string, constEnum: ConstantEnum) {
    const enumValues = Object.values(constEnum).flatMap((val) => {
        if (val && typeof val === 'object') {
            return Object.values(val).map(String);
        }
        return String(val);
    });

    if (isEmptyValue(value) || enumValues.includes(value)) {
        return;
    }

    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: `${enumValues.join(' | ')} | undefined`}});
}

/**
 * Validates if a string is a valid representation of an array.
 */
function validateArray<T extends 'string' | 'number' | 'boolean' | Record<string, unknown> | 'constantEnum' = 'string'>(
    value: string,
    arrayType: T extends Record<string, unknown>
        ? Record<keyof T, 'string' | 'number' | 'object' | 'boolean' | 'array' | PropertyTypes | ConstantEnum>
        : T extends 'constantEnum'
        ? ConstantEnum
        : T,
) {
    if (isEmptyValue(value)) {
        return;
    }

    const array = parseJSON(value) as unknown[];

    if (typeof array !== 'object' || !Array.isArray(array)) {
        throw new ArrayError(arrayType);
    }

    array.forEach((element) => {
        // Element is an object
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
            Object.entries(element).forEach(([key, val]) => {
                const expectedType = arrayType[key as keyof typeof arrayType];
                // Property is a constant enum, so we apply validateConstantEnum
                if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
                    return validateConstantEnum(String(val), expectedType as ConstantEnum);
                }
                // Expected property type is array
                if (expectedType === 'array') {
                    // Property type is not array
                    if (!Array.isArray(val)) {
                        throw new ArrayError(arrayType);
                    }
                    return;
                }
                // Property type is not one of the valid types
                if (Array.isArray(expectedType) ? !expectedType.includes(typeof val as TupleToUnion<PropertyTypes>) : typeof val !== expectedType) {
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
 * Validates if a string is a valid representation of an object.
 */
function validateObject<T extends Record<string, unknown>>(value: string, type: ObjectType<T>, collectionIndexType?: 'string' | 'number') {
    if (isEmptyValue(value)) {
        return;
    }

    const expectedType = collectionIndexType
        ? {
              [collectionIndexType]: type,
          }
        : type;

    const object = parseJSON(value) as ObjectType<T>;

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

        Object.entries(test).forEach(([key, val]) => {
            const expectedValueType = type[key];
            // val is a constant enum
            if (typeof expectedValueType === 'object') {
                return validateConstantEnum(val as string, expectedValueType);
            }
            if (expectedValueType === 'array' ? !Array.isArray(val) : typeof val !== expectedValueType) {
                throw new ObjectError(expectedType);
            }
        });
    });
}

/**
 * Validates if a string is a valid representation of a string.
 */
function validateString(value: string) {
    if (isEmptyValue(value)) {
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

/**
 * Execute validation of a union type (e.g. Record<string, string> | Array<string>)
 */
function unionValidation(firstValidation: () => void, secondValidation: () => void) {
    try {
        firstValidation();
    } catch (e) {
        secondValidation();
    }
}

/**
 * Validates if a property of Report is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateReportDraftProperty(key: keyof Report, value: string) {
    if (REPORT_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'avatarUrl': {
            return validateString(value);
        }
        case 'avatarFileName': {
            return validateString(value);
        }
        case 'chatType': {
            return validateConstantEnum(value, CONST.REPORT.CHAT_TYPE);
        }
        case 'hasOutstandingChildRequest': {
            return validateBoolean(value);
        }
        case 'hasOutstandingChildTask': {
            return validateBoolean(value);
        }
        case 'icons': {
            return validateArray<ArrayElement<Report, 'icons'>>(value, {
                type: {
                    [CONST.ICON_TYPE_AVATAR]: CONST.ICON_TYPE_AVATAR,
                    [CONST.ICON_TYPE_WORKSPACE]: CONST.ICON_TYPE_WORKSPACE,
                },
                name: 'string',
                source: 'string',
                id: ['number', 'string'],
                fallbackIcon: 'string',
                fill: 'string',
            });
        }
        case 'isOwnPolicyExpenseChat': {
            return validateBoolean(value);
        }
        case 'isPolicyExpenseChat': {
            return validateBoolean(value);
        }
        case 'isPinned': {
            return validateBoolean(value);
        }
        case 'lastMessageText': {
            return validateString(value);
        }
        case 'lastMessageTimestamp': {
            return validateNumber(value);
        }
        case 'lastVisibleActionCreated': {
            return validateString(value);
        }
        case 'lastReadCreated': {
            return validateString(value);
        }
        case 'lastReadTime': {
            return validateString(value);
        }
        case 'lastReadSequenceNumber': {
            return validateNumber(value);
        }
        case 'lastMentionedTime': {
            return validateString(value);
        }
        case 'policyAvatar': {
            return validateString(value);
        }
        case 'policyName': {
            return validateString(value);
        }
        case 'oldPolicyName': {
            return validateString(value);
        }
        case 'hasParentAccess': {
            return validateBoolean(value);
        }
        case 'description': {
            return validateString(value);
        }
        case 'isDeletedParentAction': {
            return validateBoolean(value);
        }
        case 'policyID': {
            return validateString(value);
        }
        case 'reportName': {
            return validateString(value);
        }
        case 'reportID': {
            return validateString(value);
        }
        case 'reportActionID': {
            return validateString(value);
        }
        case 'chatReportID': {
            return validateString(value);
        }
        case 'stateNum': {
            return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
        }
        case 'statusNum': {
            return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
        }
        case 'writeCapability': {
            return validateConstantEnum(value, CONST.REPORT.WRITE_CAPABILITIES);
        }
        case 'type': {
            return validateString(value);
        }
        case 'openOnAdminRoom': {
            return validateBoolean(value);
        }
        case 'visibility': {
            return validateConstantEnum(value, CONST.REPORT.VISIBILITY);
        }
        case 'cachedTotal': {
            return validateString(value);
        }
        case 'invoiceReceiver': {
            return validateObject<ObjectElement<Report, 'invoiceReceiver'>>(value, {
                type: 'string',
                policyID: 'string',
                accountID: 'string',
            });
        }
        case 'lastMessageTranslationKey': {
            return validateString(value);
        }
        case 'parentReportID': {
            return validateString(value);
        }
        case 'parentReportActionID': {
            return validateString(value);
        }
        case 'isOptimisticReport': {
            return validateBoolean(value);
        }
        case 'managerID': {
            return validateNumber(value);
        }
        case 'lastVisibleActionLastModified': {
            return validateString(value);
        }
        case 'displayName': {
            return validateString(value);
        }
        case 'lastMessageHtml': {
            return validateString(value);
        }
        case 'lastActorAccountID': {
            return validateNumber(value);
        }
        case 'lastActionType': {
            return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
        }
        case 'ownerAccountID': {
            return validateNumber(value);
        }
        case 'ownerEmail': {
            return validateString(value);
        }
        case 'participants': {
            return validateObject<ObjectElement<Report, 'participants', number>>(
                value,
                {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
                    role: CONST.REPORT.ROLE,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    pendingFields: 'object',
                    hidden: 'boolean',
                },
                'number',
            );
        }
        case 'total': {
            return validateNumber(value);
        }
        case 'unheldTotal': {
            return validateNumber(value);
        }
        case 'currency': {
            return validateString(value);
        }
        case 'errors': {
            return validateObject<ObjectElement<Report, 'errors'>>(value, {});
        }
        case 'errorFields': {
            return validateObject<ObjectElement<Report, 'errorFields', string>>(value, {}, 'string');
        }
        case 'isWaitingOnBankAccount': {
            return validateBoolean(value);
        }
        case 'isCancelledIOU': {
            return validateBoolean(value);
        }
        case 'isLastMessageDeletedParentAction': {
            return validateBoolean(value);
        }
        case 'iouReportID': {
            return validateString(value);
        }
        case 'iouReportAmount': {
            return validateNumber(value);
        }
        case 'preexistingReportID': {
            return validateString(value);
        }
        case 'nonReimbursableTotal': {
            return validateNumber(value);
        }
        case 'isHidden': {
            return validateBoolean(value);
        }
        case 'isChatRoom': {
            return validateBoolean(value);
        }
        case 'participantsList': {
            return validateArray<ArrayElement<Report, 'participantsList'>>(value, {
                displayName: 'string',
                errorFields: 'object',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                firstName: 'string',
                lastName: 'string',
                avatar: 'string',
                status: 'object',
                pendingFields: 'object',
                accountID: 'number',
                validated: 'boolean',
                phoneNumber: 'string',
                avatarThumbnail: 'string',
                originalFileName: 'string',
                avatarUploading: 'boolean',
                login: 'string',
                pronouns: 'string',
                localCurrencyCode: 'string',
                timezone: 'object',
                isOptimisticPersonalDetail: 'boolean',
                fallbackIcon: 'string',
            });
        }
        case 'text': {
            return validateString(value);
        }
        case 'privateNotes': {
            return validateObject<ObjectElement<Report, 'privateNotes', number>>(
                value,
                {
                    note: 'string',
                    errors: 'string',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    pendingFields: 'object',
                },
                'number',
            );
        }
        case 'isLoadingPrivateNotes': {
            return validateBoolean(value);
        }
        case 'selected': {
            return validateBoolean(value);
        }
        case 'pendingChatMembers': {
            return validateArray<ArrayElement<Report, 'pendingChatMembers'>>(value, {
                accountID: 'string',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                errors: 'object',
            });
        }
        case 'transactionThreadReportID': {
            return validateString(value);
        }
        case 'fieldList': {
            return validateObject<ObjectElement<Report, 'fieldList'>>(
                value,
                {
                    fieldID: 'string',
                    type: 'string',
                    name: 'string',
                    keys: 'array',
                    values: 'array',
                    defaultValue: 'string',
                    orderWeight: 'number',
                    deletable: 'boolean',
                    value: 'string',
                    target: 'string',
                    externalIDs: 'array',
                    disabledOptions: 'array',
                    isTax: 'boolean',
                    externalID: 'string',
                    origin: 'string',
                    defaultExternalID: 'string',
                },
                'string',
            );
        }
        case 'permissions': {
            return validateArray<'constantEnum'>(value, CONST.REPORT.PERMISSIONS);
        }
        case 'tripData': {
            return validateObject<ObjectElement<Report, 'tripData'>>(value, {
                startDate: 'string',
                endDate: 'string',
                tripID: 'string',
            });
        }
        case 'private_isArchived': {
            return validateString(value);
        }
        case 'participantAccountIDs': {
            return validateArray(value, 'number');
        }
        case 'visibleChatMemberAccountIDs': {
            return validateArray(value, 'number');
        }
        case 'pendingAction': {
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        }
        case 'pendingFields': {
            return validateObject<ObjectElement<Report, 'pendingFields'>>(value, {
                errors: 'string',
                text: 'string',
                description: 'string',
                privateNotes: 'string',
                currency: 'string',
                type: 'string',
                policyID: 'string',
                reportID: 'string',
                displayName: 'string',
                avatarUrl: 'string',
                avatarFileName: 'string',
                chatType: 'string',
                hasOutstandingChildRequest: 'string',
                hasOutstandingChildTask: 'string',
                icons: 'string',
                isOwnPolicyExpenseChat: 'string',
                isPolicyExpenseChat: 'string',
                isPinned: 'string',
                lastMessageText: 'string',
                lastMessageTimestamp: 'string',
                lastVisibleActionCreated: 'string',
                lastReadCreated: 'string',
                lastReadTime: 'string',
                lastReadSequenceNumber: 'string',
                lastMentionedTime: 'string',
                policyAvatar: 'string',
                policyName: 'string',
                oldPolicyName: 'string',
                hasParentAccess: 'string',
                isDeletedParentAction: 'string',
                reportName: 'string',
                reportActionID: 'string',
                chatReportID: 'string',
                stateNum: 'string',
                statusNum: 'string',
                writeCapability: 'string',
                openOnAdminRoom: 'string',
                visibility: 'string',
                cachedTotal: 'string',
                invoiceReceiver: 'string',
                lastMessageTranslationKey: 'string',
                parentReportID: 'string',
                parentReportActionID: 'string',
                isOptimisticReport: 'string',
                managerID: 'string',
                lastVisibleActionLastModified: 'string',
                lastMessageHtml: 'string',
                lastActorAccountID: 'string',
                lastActionType: 'string',
                ownerAccountID: 'string',
                ownerEmail: 'string',
                participants: 'string',
                total: 'string',
                unheldTotal: 'string',
                isWaitingOnBankAccount: 'string',
                isCancelledIOU: 'string',
                isLastMessageDeletedParentAction: 'string',
                iouReportID: 'string',
                iouReportAmount: 'string',
                preexistingReportID: 'string',
                nonReimbursableTotal: 'string',
                isHidden: 'string',
                isChatRoom: 'string',
                participantsList: 'string',
                isLoadingPrivateNotes: 'string',
                selected: 'string',
                pendingChatMembers: 'string',
                transactionThreadReportID: 'string',
                fieldList: 'string',
                permissions: 'string',
                tripData: 'string',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: 'string',
                participantAccountIDs: 'string',
                visibleChatMemberAccountIDs: 'string',
            });
        }
    }
}

/**
 * Validates if a property of ReportAction is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateReportActionDraftProperty(key: keyof ReportAction, value: string) {
    if (REPORT_ACTION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'reportID': {
            return validateString(value);
        }
        case 'reportActionID': {
            return validateString(value);
        }
        case 'parentReportID': {
            return validateString(value);
        }
        case 'errors': {
            return validateObject<ObjectElement<ReportAction, 'errors'>>(value, {});
        }
        case 'pendingAction': {
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        }
        case 'pendingFields': {
            return validateObject<ObjectElement<ReportAction, 'pendingFields'>>(value, {
                reportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                reportActionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                errors: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                sequenceNumber: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                actionName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                actorAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                actor: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                person: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                created: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isLoading: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                automatic: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                shouldShow: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childReportName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childType: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                accountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childOldestFourAccountIDs: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childCommenterCount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childLastVisibleActionCreated: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childVisibleActionCount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childManagerAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childOwnerAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childStatusNum: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childStateNum: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childLastMoneyRequestComment: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childLastActorAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childMoneyRequestCount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isFirstItem: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isAttachmentOnly: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isAttachmentWithText: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastModified: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                delegateAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                error: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childRecentReceiptTransactionIDs: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                linkMetadata: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                childReportNotificationPreference: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isNewestReportAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isOptimisticAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                adminAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                whisperedToAccountIDs: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                reportActionTimestamp: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                timestamp: CONST.RED_BRICK_ROAD_PENDING_ACTION,
            });
        }
        case 'sequenceNumber': {
            return validateNumber(value);
        }
        case 'actionName': {
            return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
        }
        case 'actorAccountID': {
            return validateNumber(value);
        }
        case 'actor': {
            return validateString(value);
        }
        case 'person': {
            return validateArray<ArrayElement<ReportAction, 'person'>>(value, {
                type: 'string',
                text: 'string',
                style: 'string',
            });
        }
        case 'created': {
            return validateDate(value);
        }
        case 'isLoading': {
            return validateBoolean(value);
        }
        case 'avatar': {
            return validateString(value);
        }
        case 'automatic': {
            return validateBoolean(value);
        }
        case 'shouldShow': {
            return validateBoolean(value);
        }
        case 'childReportID': {
            return validateString(value);
        }
        case 'childReportName': {
            return validateString(value);
        }
        case 'childType': {
            return validateString(value);
        }
        case 'accountID': {
            return validateNumber(value);
        }
        case 'childOldestFourAccountIDs': {
            return validateString(value);
        }
        case 'childCommenterCount': {
            return validateNumber(value);
        }
        case 'childLastVisibleActionCreated': {
            return validateString(value);
        }
        case 'childVisibleActionCount': {
            return validateNumber(value);
        }
        case 'childManagerAccountID': {
            return validateNumber(value);
        }
        case 'childOwnerAccountID': {
            return validateNumber(value);
        }
        case 'childStatusNum': {
            return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
        }
        case 'childStateNum': {
            return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
        }
        case 'childLastMoneyRequestComment': {
            return validateString(value);
        }
        case 'childLastActorAccountID': {
            return validateNumber(value);
        }
        case 'childMoneyRequestCount': {
            return validateNumber(value);
        }
        case 'isFirstItem': {
            return validateBoolean(value);
        }
        case 'isAttachmentOnly': {
            return validateBoolean(value);
        }
        case 'isAttachmentWithText': {
            return validateBoolean(value);
        }
        case 'receipt': {
            return validateObject<ObjectElement<ReportAction, 'receipt'>>(value, {
                state: 'string',
                type: 'string',
                name: 'string',
                receiptID: 'string',
                source: 'string',
                filename: 'string',
                reservationList: 'string',
            });
        }
        case 'lastModified': {
            return validateDate(value);
        }
        case 'delegateAccountID': {
            return validateNumber(value);
        }
        case 'error': {
            return validateString(value);
        }
        case 'childRecentReceiptTransactionIDs': {
            return validateObject<ObjectElement<ReportAction, 'childRecentReceiptTransactionIDs'>>(value, {}, 'string');
        }
        case 'linkMetadata': {
            return validateArray<ArrayElement<ReportAction, 'linkMetadata'>>(value, {
                url: 'string',
                image: 'object',
                description: 'string',
                title: 'string',
                publisher: 'string',
                logo: 'object',
            });
        }
        case 'childReportNotificationPreference': {
            return validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
        }
        case 'isNewestReportAction': {
            return validateBoolean(value);
        }
        case 'isOptimisticAction': {
            return validateBoolean(value);
        }
        case 'adminAccountID': {
            return validateNumber(value);
        }
        case 'whisperedToAccountIDs': {
            return validateArray(value, 'number');
        }
        case 'reportActionTimestamp': {
            return validateString(value);
        }
        case 'timestamp': {
            return validateString(value);
        }
        case 'message': {
            return unionValidation(
                () =>
                    validateArray<ArrayElement<ReportAction, 'message'>>(value, {
                        text: 'string',
                        html: ['string', 'undefined'],
                        type: 'string',
                        isDeletedParentAction: 'boolean',
                        policyID: 'string',
                        reportID: 'string',
                        currency: 'string',
                        amount: 'number',
                        style: 'string',
                        target: 'string',
                        href: 'string',
                        iconUrl: 'string',
                        isEdited: 'boolean',
                        isReversedTransaction: 'boolean',
                        whisperedTo: 'array',
                        moderationDecision: 'object',
                        translationKey: 'string',
                        taskReportID: 'string',
                        cancellationReason: 'string',
                        expenseReportID: 'string',
                        resolution: {
                            ...CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION,
                            ...CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION,
                        },
                        deleted: 'string',
                    }),
                () =>
                    validateObject<ObjectElement<ReportAction, 'message'>>(value, {
                        html: 'string',
                        text: 'string',
                        amount: 'string',
                        currency: 'string',
                        type: 'string',
                        policyID: 'string',
                        reportID: 'string',
                        isDeletedParentAction: 'string',
                        target: 'string',
                        style: 'string',
                        href: 'string',
                        iconUrl: 'string',
                        isEdited: 'string',
                        isReversedTransaction: 'string',
                        whisperedTo: 'string',
                        moderationDecision: 'string',
                        translationKey: 'string',
                        taskReportID: 'string',
                        cancellationReason: 'string',
                        expenseReportID: 'string',
                        resolution: 'string',
                        deleted: 'string',
                    }),
            );
        }
        case 'originalMessage': {
            return validateObject<ObjectElement<ReportAction, 'originalMessage'>>(value, {});
        }
        case 'previousMessage': {
            return validateObject<ObjectElement<ReportAction, 'previousMessage'>>(value, {
                html: 'string',
                text: 'string',
                amount: 'string',
                currency: 'string',
                type: 'string',
                policyID: 'string',
                reportID: 'string',
                style: 'string',
                target: 'string',
                href: 'string',
                iconUrl: 'string',
                isEdited: 'string',
                isDeletedParentAction: 'string',
                isReversedTransaction: 'string',
                whisperedTo: 'string',
                moderationDecision: 'string',
                translationKey: 'string',
                taskReportID: 'string',
                cancellationReason: 'string',
                expenseReportID: 'string',
                resolution: 'string',
                deleted: 'string',
            });
        }
    }
}

/**
 * Validates if a property of Transaction is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateTransactionDraftProperty(key: keyof Transaction, value: string) {
    if (TRANSACTION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'iouRequestType':
            return validateConstantEnum(value, CONST.IOU.REQUEST_TYPE);
        case 'reportID': {
            return validateString(value);
        }
        case 'participants': {
            return validateArray<ArrayElement<Transaction, 'participants'>>(value, {
                accountID: 'number',
                login: 'string',
                displayName: 'string',
                isPolicyExpenseChat: 'boolean',
                isInvoiceRoom: 'boolean',
                isOwnPolicyExpenseChat: 'boolean',
                chatType: CONST.REPORT.CHAT_TYPE,
                reportID: 'string',
                policyID: 'string',
                selected: 'boolean',
                searchText: 'string',
                alternateText: 'string',
                firstName: 'string',
                keyForList: 'string',
                lastName: 'string',
                phoneNumber: 'string',
                text: 'string',
                isSelected: 'boolean',
                isSelfDM: 'boolean',
                isSender: 'boolean',
                iouType: CONST.IOU.TYPE,
                ownerAccountID: 'number',
                icons: 'array',
                item: 'string',
            });
        }
        case 'currency': {
            return validateString(value);
        }
        case 'errors': {
            return validateObject<ObjectElement<Transaction, 'errors'>>(value, {});
        }
        case 'errorFields': {
            return validateObject<ObjectElement<Transaction, 'errorFields'>>(
                value,
                {
                    route: 'object',
                },
                'string',
            );
        }
        case 'pendingAction': {
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        }
        case 'pendingFields': {
            return validateObject<ObjectElement<Transaction, 'pendingFields'>>(
                value,
                {
                    comment: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    hold: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    isLoading: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    type: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    customUnit: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    source: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    originalTransactionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    splits: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    dismissedViolations: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    customUnitID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    customUnitRateID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    quantity: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    defaultP2PRate: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    distanceUnit: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    attendees: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    amount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    taxAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    taxCode: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    billable: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    category: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    created: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    currency: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    errors: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    filename: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    iouRequestType: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedAttendees: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedCreated: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedCurrency: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedMerchant: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedWaypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    participantsAutoAssigned: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    participants: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    reportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    routes: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    transactionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    tag: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    isFromGlobalCreate: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    taxRate: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    parentTransactionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    reimbursable: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    cardID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    status: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    hasEReceipt: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    mccGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    modifiedMCCGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    originalAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    originalCurrency: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    splitShares: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    splitPayerAccountIDs: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    shouldShowOriginalAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    actionableWhisperReportActionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    linkedTrackedExpenseReportAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    linkedTrackedExpenseReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    bank: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    cardName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    cardNumber: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    managedCard: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                },
                'string',
            );
        }
        case 'created': {
            return validateDate(value);
        }
        case 'isLoading': {
            return validateBoolean(value);
        }
        case 'receipt': {
            return validateObject<ObjectElement<Transaction, 'receipt'>>(value, {
                type: 'string',
                source: 'string',
                name: 'string',
                filename: 'string',
                state: CONST.IOU.RECEIPT_STATE,
                receiptID: 'number',
                reservationList: 'array',
            });
        }
        case 'billable': {
            return validateBoolean(value);
        }
        case 'reimbursable': {
            return validateBoolean(value);
        }
        case 'tag': {
            return validateString(value);
        }
        case 'category': {
            return validateString(value);
        }
        case 'amount': {
            return validateNumber(value);
        }
        case 'merchant': {
            return validateString(value);
        }
        case 'taxRate': {
            return validateObject<ObjectElement<Transaction, 'taxRate'>>(value, {
                keyForList: 'string',
                text: 'string',
                data: 'object',
            });
        }
        case 'taxAmount': {
            return validateNumber(value);
        }
        case 'modifiedAmount': {
            return validateNumber(value);
        }
        case 'taxCode': {
            return validateString(value);
        }
        case 'status': {
            return validateConstantEnum(value, CONST.TRANSACTION.STATUS);
        }
        case 'cardID': {
            return validateNumber(value);
        }
        case 'comment': {
            return validateObject<ObjectElement<Transaction, 'comment'>>(value, {
                comment: 'string',
                hold: 'string',
                waypoints: 'object',
                isLoading: 'boolean',
                type: CONST.TRANSACTION.TYPE,
                customUnit: 'object',
                source: 'string',
                originalTransactionID: 'string',
                splits: 'array',
                dismissedViolations: 'object',
            });
        }
        case 'attendees': {
            return validateArray<ArrayElement<Transaction, 'attendees'>>(value, {
                email: 'string',
                displayName: 'string',
                avatarUrl: 'string',
                accountID: 'number',
                text: 'string',
                login: 'string',
                searchText: 'string',
                selected: 'boolean',
                iouType: CONST.IOU.TYPE,
                reportID: 'string',
            });
        }
        case 'filename': {
            return validateString(value);
        }
        case 'modifiedAttendees': {
            return validateArray<ArrayElement<Transaction, 'attendees'>>(value, {
                email: 'string',
                displayName: 'string',
                avatarUrl: 'string',
                accountID: 'number',
                text: 'string',
                login: 'string',
                searchText: 'string',
                selected: 'boolean',
                iouType: CONST.IOU.TYPE,
                reportID: 'string',
            });
        }
        case 'modifiedCreated': {
            return validateDate(value);
        }
        case 'modifiedCurrency': {
            return validateString(value);
        }
        case 'modifiedMerchant': {
            return validateString(value);
        }
        case 'modifiedWaypoints': {
            return validateObject<ObjectElement<Transaction, 'modifiedWaypoints'>>(
                value,
                {
                    name: 'string',
                    address: 'string',
                    lat: 'number',
                    lng: 'number',
                    keyForList: 'string',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    street: 'string',
                    city: 'string',
                    state: 'string',
                    zipCode: 'string',
                    country: 'string',
                    street2: 'string',
                },
                'string',
            );
        }
        case 'participantsAutoAssigned': {
            return validateBoolean(value);
        }
        case 'routes': {
            return validateObject<ObjectElement<Transaction, 'routes'>>(
                value,
                {
                    distance: 'number',
                    geometry: 'object',
                },
                'string',
            );
        }
        case 'transactionID': {
            return validateString(value);
        }
        case 'isFromGlobalCreate': {
            return validateBoolean(value);
        }
        case 'parentTransactionID': {
            return validateString(value);
        }
        case 'hasEReceipt': {
            return validateBoolean(value);
        }
        case 'mccGroup': {
            return validateConstantEnum(value, CONST.MCC_GROUPS);
        }
        case 'modifiedMCCGroup': {
            return validateConstantEnum(value, CONST.MCC_GROUPS);
        }
        case 'originalAmount': {
            return validateNumber(value);
        }
        case 'originalCurrency': {
            return validateString(value);
        }
        case 'splitShares': {
            return validateObject<ObjectElement<Transaction, 'splitShares', number>>(
                value,
                {
                    amount: 'number',
                    isModified: 'boolean',
                },
                'number',
            );
        }
        case 'splitPayerAccountIDs': {
            return validateArray(value, 'number');
        }
        case 'shouldShowOriginalAmount': {
            return validateBoolean(value);
        }
        case 'actionableWhisperReportActionID': {
            return validateString(value);
        }
        case 'linkedTrackedExpenseReportAction': {
            return validateObject<ReportAction>(value, {
                accountID: 'number',
                message: 'string',
                created: 'string',
                error: 'string',
                avatar: 'string',
                receipt: 'object',
                reportID: 'string',
                automatic: 'boolean',
                reportActionID: 'string',
                parentReportID: 'string',
                errors: 'object',
                isLoading: 'boolean',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                pendingFields: 'object',
                sequenceNumber: 'number',
                actionName: CONST.REPORT.ACTIONS.TYPE,
                actorAccountID: 'number',
                actor: 'string',
                person: 'array',
                shouldShow: 'boolean',
                childReportID: 'string',
                childReportName: 'string',
                childType: 'string',
                childOldestFourAccountIDs: 'string',
                childCommenterCount: 'number',
                childLastVisibleActionCreated: 'string',
                childVisibleActionCount: 'number',
                childManagerAccountID: 'number',
                childOwnerAccountID: 'number',
                childStatusNum: CONST.REPORT.STATUS_NUM,
                childStateNum: CONST.REPORT.STATE_NUM,
                childLastMoneyRequestComment: 'string',
                childLastActorAccountID: 'number',
                childMoneyRequestCount: 'number',
                isFirstItem: 'boolean',
                isAttachmentOnly: 'boolean',
                isAttachmentWithText: 'boolean',
                lastModified: 'string',
                delegateAccountID: 'number',
                childRecentReceiptTransactionIDs: 'object',
                linkMetadata: 'array',
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
                isNewestReportAction: 'boolean',
                isOptimisticAction: 'boolean',
                adminAccountID: 'number',
                whisperedToAccountIDs: 'array',
                reportActionTimestamp: 'string',
                timestamp: 'string',
                originalMessage: 'object',
                previousMessage: 'object',
            });
        }
        case 'linkedTrackedExpenseReportID': {
            return validateString(value);
        }
        case 'bank': {
            return validateString(value);
        }
        case 'cardName': {
            return validateString(value);
        }
        case 'cardNumber': {
            return validateString(value);
        }
        case 'managedCard': {
            return validateBoolean(value);
        }
    }
}

function validateTransactionViolationDraftProperty(key: keyof TransactionViolation, value: string) {
    if (TRANSACTION_VIOLATION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'type': {
            return validateConstantEnum(value, CONST.VIOLATION_TYPES);
        }
        case 'name': {
            return validateConstantEnum(value, CONST.VIOLATIONS);
        }
        case 'data': {
            return validateObject<ObjectElement<TransactionViolation, 'data'>>(value, {
                rejectedBy: 'string',
                rejectReason: 'string',
                formattedLimit: 'string',
                surcharge: 'number',
                invoiceMarkup: 'number',
                maxAge: 'number',
                tagName: 'string',
                category: 'string',
                brokenBankConnection: 'boolean',
                isAdmin: 'boolean',
                email: 'string',
                isTransactionOlderThan7Days: 'boolean',
                member: 'string',
                taxName: 'string',
                tagListIndex: 'number',
                tagListName: 'string',
                errorIndexes: 'array',
                pendingPattern: 'string',
                type: CONST.MODIFIED_AMOUNT_VIOLATION_DATA,
                displayPercentVariance: 'number',
                duplicates: 'array',
                rterType: CONST.RTER_VIOLATION_TYPES,
                tooltip: 'string',
            });
        }
    }
}

/**
 * Validates if the ReportAction JSON that the user provided is of the expected type
 */
function validateReportActionJSON(json: string) {
    const parsedReportAction = parseJSON(json) as ReportAction;
    REPORT_ACTION_REQUIRED_PROPERTIES.forEach((key) => {
        if (parsedReportAction[key] !== undefined) {
            return;
        }

        throw new SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
    });
    Object.entries(parsedReportAction).forEach(([key, val]) => {
        try {
            if (!isEmptyValue(val as string) && REPORT_ACTION_NUMBER_PROPERTIES.includes(key as keyof ReportAction) && typeof val !== 'number') {
                throw new NumberError();
            }
            validateReportActionDraftProperty(key as keyof ReportAction, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw new SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    });
}

function validateTransactionViolationJSON(json: string) {
    const parsedTransactionViolation = parseJSON(json) as TransactionViolation;
    TRANSACTION_VIOLATION_REQUIRED_PROPERTIES.forEach((key) => {
        if (parsedTransactionViolation[key] !== undefined) {
            return;
        }

        throw new SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
    });
    Object.entries(parsedTransactionViolation).forEach(([key, val]) => {
        try {
            validateTransactionViolationDraftProperty(key as keyof TransactionViolation, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw new SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    });
}

/**
 * Gets the reason for showing LHN row
 */
function getReasonForShowingRowInLHN(report: OnyxEntry<Report>, hasRBR = false): TranslationPaths | null {
    if (!report) {
        return null;
    }

    const doesReportHaveViolations = ReportUtils.shouldShowViolations(report, transactionViolations);

    const reason = ReportUtils.reasonForReportToBeInOptionList({
        report,
        // We can't pass report.reportID because it will cause reason to always be isFocused
        currentReportId: '-1',
        isInFocusMode: !!isInFocusMode,
        betas,
        policies,
        excludeEmptyChats: true,
        doesReportHaveViolations,
        includeSelfDM: true,
    });

    if (!([CONST.REPORT_IN_LHN_REASONS.HAS_ADD_WORKSPACE_ROOM_ERRORS, CONST.REPORT_IN_LHN_REASONS.HAS_IOU_VIOLATIONS] as Array<typeof reason>).includes(reason) && hasRBR) {
        return `debug.reasonVisibleInLHN.hasRBR`;
    }

    // When there's no specific reason, we default to isFocused if the report is only showing because we're viewing it
    // Otherwise we return hasRBR if the report has errors other that failed receipt
    if (reason === null || reason === CONST.REPORT_IN_LHN_REASONS.DEFAULT) {
        return 'debug.reasonVisibleInLHN.isFocused';
    }

    return `debug.reasonVisibleInLHN.${reason}`;
}

type GBRReasonAndReportAction = {
    reason: TranslationPaths;
    reportAction: OnyxEntry<ReportAction>;
};

/**
 * Gets the reason and report action that is causing the GBR to show up in LHN row
 */
function getReasonAndReportActionForGBRInLHNRow(report: OnyxEntry<Report>): GBRReasonAndReportAction | null {
    if (!report) {
        return null;
    }

    const {reason, reportAction} = ReportUtils.getReasonAndReportActionThatRequiresAttention(report) ?? {};

    if (reason) {
        return {reason: `debug.reasonGBR.${reason}`, reportAction};
    }

    return null;
}

type RBRReasonAndReportAction = {
    reason: TranslationPaths;
    reportAction: OnyxEntry<ReportAction>;
};

/**
 * Gets the report action that is causing the RBR to show up in LHN
 */
function getReasonAndReportActionForRBRInLHNRow(report: Report, reportActions: OnyxEntry<ReportActions>, hasViolations: boolean): RBRReasonAndReportAction | null {
    const {reason, reportAction} = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(report, reportActions, hasViolations, transactionViolations) ?? {};

    if (reason) {
        return {reason: `debug.reasonRBR.${reason}`, reportAction};
    }

    return null;
}

function getTransactionID(report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>) {
    const transactionID = TransactionUtils.getTransactionID(report?.reportID ?? '-1');

    return Number(transactionID) > 0
        ? transactionID
        : Object.values(reportActions ?? {})
              .map((reportAction) => ReportActionsUtils.getLinkedTransactionID(reportAction))
              .find(Boolean);
}

const DebugUtils = {
    stringifyJSON,
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
    validateTransactionDraftProperty,
    validateTransactionViolationDraftProperty,
    validateReportActionJSON,
    validateTransactionViolationJSON,
    getReasonForShowingRowInLHN,
    getReasonAndReportActionForGBRInLHNRow,
    getReasonAndReportActionForRBRInLHNRow,
    getTransactionID,
    REPORT_ACTION_REQUIRED_PROPERTIES,
    REPORT_REQUIRED_PROPERTIES,
    TRANSACTION_REQUIRED_PROPERTIES,
};

export type {ObjectType, OnyxDataType};

export default DebugUtils;
