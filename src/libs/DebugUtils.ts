/* eslint-disable max-classes-per-file */
import {isMatch, isValid} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy, Report, ReportAction, ReportActions, TransactionViolation} from '@src/types/onyx';
import * as ReportUtils from './ReportUtils';

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

type ObjectType = Record<string, 'string' | 'number' | 'object' | 'array' | 'boolean' | ConstantEnum>;

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
    'reportActionTimestamp',
    'timestamp',
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
 * Validates if a string is a valid representation of a number.
 */
function validateNumber(value: string) {
    if (value === 'undefined' || value === '' || (!value.includes(' ') && !Number.isNaN(Number(value)))) {
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
    if (value === 'undefined' || (isMatch(value, CONST.DATE.FNS_DB_FORMAT_STRING) && isValid(new Date(value)))) {
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

    if (value === 'undefined' || value === '' || enumValues.includes(value)) {
        return;
    }

    throw new SyntaxError('debug.invalidValue', {cause: {expectedValues: `${enumValues.join(' | ')} | undefined`}});
}

/**
 * Validates if a string is a valid representation of an array.
 */
function validateArray(
    value: string,
    arrayType: 'string' | 'number' | 'boolean' | ConstantEnum | Record<string, 'string' | 'number' | 'object' | 'boolean' | 'array' | PropertyTypes | ConstantEnum>,
) {
    if (value === 'undefined') {
        return;
    }

    const array = parseJSON(value) as unknown[];

    if (typeof array !== 'object' || !Array.isArray(array)) {
        throw new ArrayError(arrayType);
    }

    array.forEach((element) => {
        // Element is an object
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
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
 * Validates if a string is a valid representation of an object.
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
 * Validates if a string is a valid representation of a string.
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

/**
 * Validates if a property of Report is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
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
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
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

/**
 * Validates if a property of ReportAction is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
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
    if (key === 'originalMessage') {
        return validateObject(value, {});
    }
    if (key === 'childRecentReceiptTransactionIDs') {
        return validateObject(value, {}, 'string');
    }
    validateString(value);
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

/**
 * Gets the report action that is causing the RBR to show up in LHN
 */
function getRBRReportAction(report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> {
    const {reportAction} = ReportUtils.getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

    return reportAction;
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
    validateReportActionJSON,
    getReasonForShowingRowInLHN,
    getReasonAndReportActionForGBRInLHNRow,
    getRBRReportAction,
    REPORT_ACTION_REQUIRED_PROPERTIES,
    REPORT_REQUIRED_PROPERTIES,
};

export type {ObjectType, OnyxDataType};

export default DebugUtils;
