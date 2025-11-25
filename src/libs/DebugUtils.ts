/* eslint-disable default-case */

/* eslint-disable max-classes-per-file */
import {isMatch, isValid} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Beta, Report, ReportAction, ReportActions, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Comment} from '@src/types/onyx/Transaction';
import SafeString from '@src/utils/SafeString';
import {getLinkedTransactionID} from './ReportActionsUtils';
import {getReasonAndReportActionThatRequiresAttention, reasonForReportToBeInOptionList} from './ReportUtils';
import SidebarUtils from './SidebarUtils';
import {getTransactionID as TransactionUtilsGetTransactionID} from './TransactionUtils';

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

type ObjectElement<TOnyx, K extends keyof TOnyx, TCollectionKey extends string | number | undefined = undefined> =
    Required<TOnyx>[K] extends Record<string | number, infer ValueType>
        ? TCollectionKey extends string | number
            ? {[ValueTypeKey in KeysOfUnion<ValueType>]: ValueType[ValueTypeKey]}
            : {[ElementKey in KeysOfUnion<Required<TOnyx>[K]>]: Required<Required<TOnyx>[K]>[ElementKey]}
        : never;

const OPTIONAL_BOOLEAN_STRINGS = ['true', 'false', 'undefined'];

const REPORT_REQUIRED_PROPERTIES: Array<keyof Report | keyof ReportNameValuePairs> = ['reportID'] satisfies Array<keyof Report | keyof ReportNameValuePairs>;

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

    return SafeString(data);
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

    return text === SafeString(data);
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
 * @param value - string representation
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

    for (const element of array) {
        // Element is an object
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
            for (const [key, val] of Object.entries(element)) {
                const expectedType = arrayType[key as keyof typeof arrayType];
                // Property is a constant enum, so we apply validateConstantEnum
                if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
                    validateConstantEnum(String(val), expectedType as ConstantEnum);
                    continue;
                }
                // Expected property type is array
                if (expectedType === 'array') {
                    // Property type is not array
                    if (!Array.isArray(val)) {
                        throw new ArrayError(arrayType);
                    }
                    continue;
                }
                // Property type is not one of the valid types
                if (Array.isArray(expectedType) ? !expectedType.includes(typeof val as TupleToUnion<PropertyTypes>) : typeof val !== expectedType) {
                    throw new ArrayError(arrayType);
                }
            }
            continue;
        }
        // Element is a constant enum
        if (typeof arrayType === 'object') {
            // Element doesn't exist in enum
            if (!Object.values(arrayType).includes(element)) {
                throw new ArrayError(arrayType);
            }
            continue;
        }
        // Element is not a valid type
        if (typeof element !== arrayType) {
            throw new ArrayError(arrayType);
        }
    }
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
        for (const key of Object.keys(object)) {
            try {
                if (collectionIndexType === 'number') {
                    validateNumber(key);
                }
            } catch (e) {
                throw new ObjectError(expectedType);
            }
        }
    }

    const tests = collectionIndexType ? (Object.values(object) as unknown as Array<Record<string, 'string' | 'number' | 'object'>>) : [object];

    for (const test of tests) {
        if (typeof test !== 'object' || Array.isArray(test)) {
            throw new ObjectError(expectedType);
        }

        for (const [key, val] of Object.entries(test)) {
            const expectedValueType = type[key];
            // val is a constant enum
            if (typeof expectedValueType === 'object') {
                validateConstantEnum(val as string, expectedValueType);
                continue;
            }
            if (expectedValueType === 'array' ? !Array.isArray(val) : typeof val !== expectedValueType) {
                throw new ObjectError(expectedType);
            }
        }
    }
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
function validateReportDraftProperty(key: keyof Report | keyof ReportNameValuePairs, value: string) {
    if (REPORT_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'avatarUrl':
        case 'created':
        case 'lastMessageText':
        case 'lastVisibleActionCreated':
        case 'lastReadTime':
        case 'lastMentionedTime':
        case 'policyAvatar':
        case 'policyName':
        case 'oldPolicyName':
        case 'description':
        case 'policyID':
        case 'reportName':
        case 'reportID':
        case 'chatReportID':
        case 'type':
        case 'parentReportID':
        case 'parentReportActionID':
        case 'lastVisibleActionLastModified':
        case 'lastMessageHtml':
        case 'currency':
        case 'iouReportID':
        case 'preexistingReportID':
        case 'private_isArchived':
        case 'welcomeMessage':
            return validateString(value);
        case 'hasOutstandingChildRequest':
        case 'hasOutstandingChildTask':
        case 'isOwnPolicyExpenseChat':
        case 'isPinned':
        case 'hasParentAccess':
        case 'isDeletedParentAction':
        case 'isWaitingOnBankAccount':
        case 'hasReportBeenRetracted':
        case 'isCancelledIOU':
        case 'hasReportBeenReopened':
        case 'isExportedToIntegration':
        case 'hasExportError':
            return validateBoolean(value);
        case 'exportFailedTime':
        case 'lastReadSequenceNumber':
        case 'managerID':
        case 'lastActorAccountID':
        case 'ownerAccountID':
        case 'total':
        case 'unheldTotal':
        case 'nonReimbursableTotal':
        case 'unheldNonReimbursableTotal':
        case 'transactionCount':
            return validateNumber(value);
        case 'chatType':
            return validateConstantEnum(value, CONST.REPORT.CHAT_TYPE);
        case 'stateNum':
            return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
        case 'statusNum':
            return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
        case 'writeCapability':
            return validateConstantEnum(value, CONST.REPORT.WRITE_CAPABILITIES);
        case 'visibility':
            return validateConstantEnum(value, CONST.REPORT.VISIBILITY);
        case 'invoiceReceiver':
            return validateObject<ObjectElement<Report, 'invoiceReceiver'>>(value, {
                type: 'string',
                policyID: 'string',
                accountID: 'string',
            });
        case 'lastActionType':
            return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
        case 'participants':
            return validateObject<ObjectElement<Report, 'participants', number>>(
                value,
                {
                    role: CONST.REPORT.ROLE,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    pendingFields: 'object',
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
                    permissions: 'array',
                },
                'number',
            );
        case 'errorFields':
            return validateObject<ObjectElement<Report, 'errorFields', string>>(value, {}, 'string');
        case 'errors':
            return validateObject<ObjectElement<Report, 'errors'>>(value, {});
        case 'privateNotes':
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
        case 'fieldList':
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
        case 'permissions':
            return validateArray<'constantEnum'>(value, CONST.REPORT.PERMISSIONS);
        case 'nextStep':
            return validateObject<ObjectElement<Report, 'nextStep'>>(value, {
                messageKey: 'string',
                icon: 'string',
                actorAccountID: 'number',
                eta: 'object',
            });
        case 'tripData':
            return validateObject<ObjectElement<Report, 'tripData'>>(value, {
                startDate: 'string',
                endDate: 'string',
                tripID: 'string',
                payload: 'object',
            });
        case 'calendlySchedule':
            return validateObject<ObjectElement<ReportNameValuePairs, 'calendlySchedule'>>(value, {
                isLoading: 'boolean',
                data: 'object',
                errors: 'object',
            });
        case 'calendlyCalls':
            return validateArray<ArrayElement<ReportNameValuePairs, 'calendlyCalls'>>(value, {
                status: 'string',
                host: 'number',
                eventTime: 'string',
                eventURI: 'string',
                inserted: 'string',
            });
        case 'agentZeroProcessingRequestIndicator':
            return validateString(value);
        case 'pendingAction':
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
            return validateObject<ObjectElement<Report | ReportNameValuePairs, 'pendingFields'>>(value, {
                description: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                privateNotes: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                currency: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                type: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                policyID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                reportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                avatarUrl: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                chatType: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasOutstandingChildRequest: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasOutstandingChildTask: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isOwnPolicyExpenseChat: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isPinned: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastMessageText: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastVisibleActionCreated: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastReadTime: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastReadSequenceNumber: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastMentionedTime: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                policyAvatar: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                policyName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                oldPolicyName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasParentAccess: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isDeletedParentAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                chatReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                stateNum: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                statusNum: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                writeCapability: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                visibility: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                invoiceReceiver: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportActionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastVisibleActionLastModified: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastMessageHtml: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastActorAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                lastActionType: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                ownerAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                participants: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                total: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                unheldTotal: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                unheldNonReimbursableTotal: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isWaitingOnBankAccount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isCancelledIOU: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasReportBeenRetracted: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasReportBeenReopened: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                isExportedToIntegration: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                hasExportError: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                iouReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                preexistingReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                nonReimbursableTotal: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                fieldList: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                permissions: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                tripData: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                private_isArchived: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                preview: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                welcomeMessage: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                errors: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                exportFailedTime: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                calendlySchedule: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                calendlyCalls: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                agentZeroProcessingRequestIndicator: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                created: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                transactionCount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
            });
        case 'expensify_text_title':
            return validateObject<ObjectElement<ReportNameValuePairs, 'expensify_text_title'>>(value, {
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
            });
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
        case 'reportID':
        case 'reportActionID':
        case 'parentReportID':
        case 'childReportID':
        case 'childReportName':
        case 'childType':
        case 'childOldestFourAccountIDs':
        case 'childLastVisibleActionCreated':
        case 'actor':
        case 'avatar':
        case 'childLastMoneyRequestComment':
        case 'reportActionTimestamp':
        case 'timestamp':
        case 'error':
            return validateString(value);
        case 'actorAccountID':
        case 'sequenceNumber':
        case 'accountID':
        case 'childCommenterCount':
        case 'childVisibleActionCount':
        case 'childManagerAccountID':
        case 'childOwnerAccountID':
        case 'childLastActorAccountID':
        case 'childMoneyRequestCount':
        case 'adminAccountID':
        case 'delegateAccountID':
            return validateNumber(value);
        case 'isLoading':
        case 'automatic':
        case 'shouldShow':
        case 'isFirstItem':
        case 'isAttachmentOnly':
        case 'isAttachmentWithText':
        case 'isNewestReportAction':
        case 'isOptimisticAction':
            return validateBoolean(value);
        case 'created':
        case 'lastModified':
            return validateDate(value);
        case 'errors':
            return validateObject<ObjectElement<ReportAction, 'errors'>>(value, {});
        case 'pendingAction':
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
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
        case 'actionName':
            return validateConstantEnum(value, CONST.REPORT.ACTIONS.TYPE);
        case 'person':
            return validateArray<ArrayElement<ReportAction, 'person'>>(value, {
                type: 'string',
                text: 'string',
                style: 'string',
            });
        case 'childStatusNum':
            return validateConstantEnum(value, CONST.REPORT.STATUS_NUM);
        case 'childStateNum':
            return validateConstantEnum(value, CONST.REPORT.STATE_NUM);
        case 'receipt':
            return validateObject<ObjectElement<ReportAction, 'receipt'>>(value, {
                state: 'string',
                type: 'string',
                name: 'string',
                receiptID: 'string',
                source: 'string',
                filename: 'string',
                reservationList: 'string',
                isTestReceipt: 'boolean',
                isTestDriveReceipt: 'boolean',
            });
        case 'childRecentReceiptTransactionIDs':
            return validateObject<ObjectElement<ReportAction, 'childRecentReceiptTransactionIDs'>>(value, {}, 'string');
        case 'linkMetadata':
            return validateArray<ArrayElement<ReportAction, 'linkMetadata'>>(value, {
                url: 'string',
                image: 'object',
                description: 'string',
                title: 'string',
                publisher: 'string',
                logo: 'object',
            });
        case 'childReportNotificationPreference':
            return validateConstantEnum(value, CONST.REPORT.NOTIFICATION_PREFERENCE);
        case 'whisperedToAccountIDs':
            return validateArray(value, 'number');
        case 'message':
            return unionValidation(
                () =>
                    validateArray<ArrayElement<ReportAction, 'message'>>(value, {
                        text: 'string',
                        html: 'string',
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
                        bankAccountID: 'string',
                        payAsBusiness: 'string',
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
                        isDeletedParentAction: 'boolean',
                        target: 'string',
                        style: 'string',
                        href: 'string',
                        iconUrl: 'boolean',
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
            );
        case 'originalMessage':
            return validateObject<ObjectElement<ReportAction, 'originalMessage'>>(value, {});
        case 'previousMessage':
            return unionValidation(
                () =>
                    validateObject<ObjectElement<ReportAction, 'previousMessage'>>(value, {
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
                        isEdited: 'boolean',
                        isDeletedParentAction: 'boolean',
                        isReversedTransaction: 'boolean',
                        whisperedTo: 'array',
                        moderationDecision: 'string',
                        translationKey: 'string',
                        taskReportID: 'string',
                        cancellationReason: 'string',
                        expenseReportID: 'string',
                        resolution: 'string',
                        deleted: 'string',
                    }),
                () =>
                    validateArray<ArrayElement<ReportAction, 'previousMessage'>>(value, {
                        reportID: 'string',
                        html: 'string',
                        text: 'string',
                        amount: 'string',
                        currency: 'string',
                        type: 'string',
                        policyID: 'string',
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
                        bankAccountID: 'string',
                        payAsBusiness: 'string',
                    }),
            );
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
        case 'reportID':
        case 'reportName':
        case 'currency':
        case 'tag':
        case 'category':
        case 'merchant':
        case 'taxCode':
        case 'filename':
        case 'modifiedCurrency':
        case 'modifiedMerchant':
        case 'transactionID':
        case 'parentTransactionID':
        case 'originalCurrency':
        case 'actionableWhisperReportActionID':
        case 'linkedTrackedExpenseReportID':
        case 'bank':
        case 'cardName':
        case 'cardNumber':
        case 'taxValue':
            return validateString(value);
        case 'created':
        case 'modifiedCreated':
        case 'inserted':
        case 'posted':
            return validateDate(value);
        case 'isLoading':
        case 'billable':
        case 'reimbursable':
        case 'participantsAutoAssigned':
        case 'isFromGlobalCreate':
        case 'hasEReceipt':
        case 'shouldShowOriginalAmount':
        case 'managedCard':
            return validateBoolean(value);
        case 'amount':
        case 'taxAmount':
        case 'modifiedAmount':
        case 'cardID':
        case 'originalAmount':
        case 'convertedAmount':
            return validateNumber(value);
        case 'iouRequestType':
            return validateConstantEnum(value, CONST.IOU.REQUEST_TYPE);
        case 'participants':
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
                avatar: 'string',
                item: 'string',
            });
        case 'errors':
            return validateObject<ObjectElement<Transaction, 'errors'>>(value, {});
        case 'errorFields':
            return validateObject<ObjectElement<Transaction, 'errorFields'>>(
                value,
                {
                    route: 'object',
                },
                'string',
            );
        case 'pendingAction':
            return validateConstantEnum(value, CONST.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
            return validateObject<ObjectElement<Transaction, 'pendingFields'>>(
                value,
                {
                    attributes: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    subRates: CONST.RED_BRICK_ROAD_PENDING_ACTION,
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
                    convertedAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
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
                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
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
                    shouldShowOriginalAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    actionableWhisperReportActionID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    linkedTrackedExpenseReportAction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    linkedTrackedExpenseReportID: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    bank: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    liabilityType: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    cardName: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    cardNumber: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    managedCard: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    posted: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    inserted: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    accountant: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    splitExpenses: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    isDemoTransaction: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    splitExpensesTotal: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                    taxValue: CONST.RED_BRICK_ROAD_PENDING_ACTION,
                },
                'string',
            );
        case 'receipt':
            return validateObject<ObjectElement<Transaction, 'receipt'>>(value, {
                type: 'string',
                source: 'string',
                name: 'string',
                filename: 'string',
                state: CONST.IOU.RECEIPT_STATE,
                receiptID: 'number',
                reservationList: 'array',
                isTestReceipt: 'boolean',
                isTestDriveReceipt: 'boolean',
            });
        case 'taxRate':
            return validateObject<ObjectElement<Transaction, 'taxRate'>>(value, {
                keyForList: 'string',
                text: 'string',
                data: 'object',
            });
        case 'status':
            return validateConstantEnum(value, CONST.TRANSACTION.STATUS);
        case 'comment':
            return validateObject<ObjectElement<Transaction, 'comment'>>(value, {
                comment: 'string',
                hold: 'string',
                waypoints: 'object',
                attendees: 'array',
                isLoading: 'boolean',
                type: CONST.TRANSACTION.TYPE,
                customUnit: 'object',
                source: 'string',
                originalTransactionID: 'string',
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE,
                splits: 'array',
                dismissedViolations: 'object',
                splitExpenses: 'array',
                isDemoTransaction: 'boolean',
                splitExpensesTotal: 'number',
            });
        case 'accountant':
            return validateObject<ObjectElement<Transaction, 'accountant'>>(value, {
                accountID: 'number',
                login: 'string',
            });
        case 'modifiedAttendees':
            return validateArray<ArrayElement<Comment, 'attendees'>>(value, {
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
        case 'modifiedWaypoints':
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
        case 'routes':
            return validateObject<ObjectElement<Transaction, 'routes'>>(
                value,
                {
                    distance: 'number',
                    geometry: 'object',
                },
                'string',
            );
        case 'mccGroup':
            return validateConstantEnum(value, CONST.MCC_GROUPS);
        case 'modifiedMCCGroup':
            return validateConstantEnum(value, CONST.MCC_GROUPS);
        case 'splitShares':
            return validateObject<ObjectElement<Transaction, 'splitShares', number>>(
                value,
                {
                    amount: 'number',
                    isModified: 'boolean',
                },
                'number',
            );
        case 'linkedTrackedExpenseReportAction':
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
}

function validateTransactionViolationDraftProperty(key: keyof TransactionViolation, value: string) {
    if (TRANSACTION_VIOLATION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'type':
            return validateConstantEnum(value, CONST.VIOLATION_TYPES);

        case 'name':
            return validateConstantEnum(value, CONST.VIOLATIONS);

        case 'data':
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
                message: 'string',
                field: 'string',
                prohibitedExpenseRule: 'string',
                comment: 'string',
            });
        case 'showInReview':
            return validateBoolean(value);
    }
}

/**
 * Validates if the ReportAction JSON that the user provided is of the expected type
 */
function validateReportActionJSON(json: string) {
    const parsedReportAction = parseJSON(json) as ReportAction;
    for (const key of REPORT_ACTION_REQUIRED_PROPERTIES) {
        if (parsedReportAction[key] !== undefined) {
            continue;
        }

        throw new SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
    }
    for (const [key, val] of Object.entries(parsedReportAction)) {
        try {
            if (!isEmptyValue(val as string) && REPORT_ACTION_NUMBER_PROPERTIES.includes(key as keyof ReportAction) && typeof val !== 'number') {
                throw new NumberError();
            }
            validateReportActionDraftProperty(key as keyof ReportAction, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw new SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    }
}

function validateTransactionViolationJSON(json: string) {
    const parsedTransactionViolation = parseJSON(json) as TransactionViolation;
    for (const key of TRANSACTION_VIOLATION_REQUIRED_PROPERTIES) {
        if (parsedTransactionViolation[key] !== undefined) {
            continue;
        }

        throw new SyntaxError('debug.missingProperty', {cause: {propertyName: key}});
    }
    for (const [key, val] of Object.entries(parsedTransactionViolation)) {
        try {
            validateTransactionViolationDraftProperty(key as keyof TransactionViolation, onyxDataToString(val));
        } catch (e) {
            const {cause} = e as SyntaxError & {cause: {expectedValues: string}};
            throw new SyntaxError('debug.invalidProperty', {cause: {propertyName: key, expectedType: cause.expectedValues}});
        }
    }
}

/**
 * Gets the reason for showing LHN row
 */
function getReasonForShowingRowInLHN({
    report,
    chatReport,
    doesReportHaveViolations,
    hasRBR = false,
    isReportArchived,
    isInFocusMode = false,
    betas = undefined,
    draftComment,
}: {
    report: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    doesReportHaveViolations: boolean;
    hasRBR?: boolean;
    isReportArchived: boolean | undefined;
    isInFocusMode?: boolean;
    betas?: OnyxEntry<Beta[]>;
    draftComment: string | undefined;
}): TranslationPaths | null {
    if (!report) {
        return null;
    }

    const reason = reasonForReportToBeInOptionList({
        report,
        chatReport,
        // We can't pass report.reportID because it will cause reason to always be isFocused
        currentReportId: '-1',
        isInFocusMode,
        betas,
        excludeEmptyChats: true,
        doesReportHaveViolations,
        includeSelfDM: true,
        isReportArchived,
        draftComment,
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
function getReasonAndReportActionForGBRInLHNRow(report: OnyxEntry<Report>, isReportArchived = false): GBRReasonAndReportAction | null {
    if (!report) {
        return null;
    }

    const {reason, reportAction} = getReasonAndReportActionThatRequiresAttention(report, undefined, isReportArchived) ?? {};

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
function getReasonAndReportActionForRBRInLHNRow(
    report: Report,
    chatReport: OnyxEntry<Report>,
    reportActions: OnyxEntry<ReportActions>,
    transactions: OnyxCollection<Transaction>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    hasViolations: boolean,
    reportErrors: Errors,
    isArchivedReport = false,
): RBRReasonAndReportAction | null {
    const {reason, reportAction} =
        SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(report, chatReport, reportActions, hasViolations, reportErrors, transactions, transactionViolations, isArchivedReport) ?? {};

    if (reason) {
        return {reason: `debug.reasonRBR.${reason}`, reportAction};
    }

    return null;
}

function getTransactionID(report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>) {
    const transactionID = TransactionUtilsGetTransactionID(report?.reportID);

    return Number(transactionID) > 0
        ? transactionID
        : Object.values(reportActions ?? {})
              .map((reportAction) => getLinkedTransactionID(reportAction))
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
