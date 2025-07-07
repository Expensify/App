"use strict";
/* eslint-disable default-case */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-classes-per-file */
var date_fns_1 = require("date-fns");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var SidebarUtils_1 = require("./SidebarUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var NumberError = /** @class */ (function (_super) {
    __extends(NumberError, _super);
    function NumberError() {
        return _super.call(this, 'debug.invalidValue', { cause: { expectedValues: 'number | undefined | ""' } }) || this;
    }
    return NumberError;
}(SyntaxError));
var ArrayError = /** @class */ (function (_super) {
    __extends(ArrayError, _super);
    function ArrayError(arrayType) {
        return _super.call(this, 'debug.invalidValue', {
            cause: {
                expectedValues: "[".concat(typeof arrayType === 'object' ? stringifyJSON(arrayType) : arrayType, "]"),
            },
        }) || this;
    }
    return ArrayError;
}(SyntaxError));
var ObjectError = /** @class */ (function (_super) {
    __extends(ObjectError, _super);
    function ObjectError(type) {
        return _super.call(this, 'debug.invalidValue', {
            cause: {
                expectedValues: "".concat(stringifyJSON(type), " | undefined | ''"),
            },
        }) || this;
    }
    return ObjectError;
}(SyntaxError));
var OPTIONAL_BOOLEAN_STRINGS = ['true', 'false', 'undefined'];
var REPORT_REQUIRED_PROPERTIES = ['reportID'];
var REPORT_ACTION_REQUIRED_PROPERTIES = ['reportActionID', 'created', 'actionName'];
var REPORT_ACTION_NUMBER_PROPERTIES = [
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
];
var TRANSACTION_REQUIRED_PROPERTIES = ['transactionID', 'reportID', 'amount', 'created', 'currency', 'merchant'];
var TRANSACTION_VIOLATION_REQUIRED_PROPERTIES = ['type', 'name'];
var isInFocusMode;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIORITY_MODE,
    callback: function (priorityMode) {
        isInFocusMode = priorityMode === CONST_1.default.PRIORITY_MODE.GSD;
    },
});
var transactionViolations;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        transactionViolations = value;
    },
});
var betas;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.BETAS,
    callback: function (value) {
        betas = value;
    },
});
function stringifyJSON(data) {
    return JSON.stringify(data, null, 6);
}
function parseJSON(json) {
    return JSON.parse(json.replaceAll('\n', ''));
}
/**
 * Converts onyx data into string representation.
 *
 * @param data - data to be converted into string
 * @returns converted data
 */
function onyxDataToString(data) {
    if (data === undefined) {
        return 'undefined';
    }
    if (typeof data === 'object') {
        return stringifyJSON(data);
    }
    return String(data);
}
/**
 * Converted strings into the expected onyx data type.
 *
 * @param data - string representation of the data is going to be converted
 * @param type - expected type
 * @returns conversion result of data into the expected type
 * @throws {SyntaxError} if type is object but the provided string does not represent an object
 */
function stringToOnyxData(data, type) {
    if (isEmptyValue(data)) {
        return data;
    }
    var onyxData;
    switch (type) {
        case 'number':
            onyxData = Number(data);
            break;
        case 'object':
            onyxData = parseJSON(data);
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
    return onyxData;
}
/**
 * Compares string representation of onyx data with the original data, using type conversion
 *
 * @param text - string representation
 * @param data - original data
 * @returns whether or not the string representation is equal to the original data
 */
function compareStringWithOnyxData(text, data) {
    if (data === undefined) {
        return text === 'undefined';
    }
    if (typeof data === 'object') {
        return text === stringifyJSON(data);
    }
    return text === String(data);
}
/**
 * Determines the number of lines needed to display the data.
 *
 * @param data - string representation
 * @returns number of lines needed to display the data
 */
function getNumberOfLinesFromString(data) {
    return data.split('\n').length || 1;
}
/**
 * Converts every value from an onyx data object into it's string representation, to be used as draft data.
 *
 * @param data - onyx data object
 * @returns converted data object
 */
function onyxDataToDraftData(data) {
    return Object.fromEntries(Object.entries(data !== null && data !== void 0 ? data : {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, onyxDataToString(value)];
    }));
}
/**
 * Whether a string representation is an empty value
 *
 * @param value - string representation
 * @returns whether the value is an empty value
 */
function isEmptyValue(value) {
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
function validateNumber(value) {
    if (isEmptyValue(value) || (!value.includes(' ') && !Number.isNaN(Number(value)))) {
        return;
    }
    throw new NumberError();
}
/**
 * Validates if a string is a valid representation of a boolean.
 */
function validateBoolean(value) {
    if (OPTIONAL_BOOLEAN_STRINGS.includes(value)) {
        return;
    }
    throw new SyntaxError('debug.invalidValue', { cause: { expectedValues: OPTIONAL_BOOLEAN_STRINGS.join(' | ') } });
}
/**
 * Validates if a string is a valid representation of a date.
 */
function validateDate(value) {
    if (isEmptyValue(value) || (((0, date_fns_1.isMatch)(value, CONST_1.default.DATE.FNS_DB_FORMAT_STRING) || (0, date_fns_1.isMatch)(value, CONST_1.default.DATE.FNS_FORMAT_STRING)) && (0, date_fns_1.isValid)(new Date(value)))) {
        return;
    }
    throw new SyntaxError('debug.invalidValue', { cause: { expectedValues: CONST_1.default.DATE.FNS_DB_FORMAT_STRING } });
}
/**
 * Validates if a string is a valid representation of an enum value.
 */
function validateConstantEnum(value, constEnum) {
    var enumValues = Object.values(constEnum).flatMap(function (val) {
        if (val && typeof val === 'object') {
            return Object.values(val).map(String);
        }
        return String(val);
    });
    if (isEmptyValue(value) || enumValues.includes(value)) {
        return;
    }
    throw new SyntaxError('debug.invalidValue', { cause: { expectedValues: "".concat(enumValues.join(' | '), " | undefined") } });
}
/**
 * Validates if a string is a valid representation of an array.
 */
function validateArray(value, arrayType) {
    if (isEmptyValue(value)) {
        return;
    }
    var array = parseJSON(value);
    if (typeof array !== 'object' || !Array.isArray(array)) {
        throw new ArrayError(arrayType);
    }
    array.forEach(function (element) {
        // Element is an object
        if (element && typeof element === 'object' && typeof arrayType === 'object') {
            Object.entries(element).forEach(function (_a) {
                var key = _a[0], val = _a[1];
                var expectedType = arrayType[key];
                // Property is a constant enum, so we apply validateConstantEnum
                if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
                    return validateConstantEnum(String(val), expectedType);
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
                if (Array.isArray(expectedType) ? !expectedType.includes(typeof val) : typeof val !== expectedType) {
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
function validateObject(value, type, collectionIndexType) {
    var _a;
    if (isEmptyValue(value)) {
        return;
    }
    var expectedType = collectionIndexType
        ? (_a = {},
            _a[collectionIndexType] = type,
            _a) : type;
    var object = parseJSON(value);
    if (typeof object !== 'object' || Array.isArray(object)) {
        throw new ObjectError(expectedType);
    }
    if (collectionIndexType) {
        Object.keys(object).forEach(function (key) {
            try {
                if (collectionIndexType === 'number') {
                    validateNumber(key);
                }
            }
            catch (e) {
                throw new ObjectError(expectedType);
            }
        });
    }
    var tests = collectionIndexType ? Object.values(object) : [object];
    tests.forEach(function (test) {
        if (typeof test !== 'object' || Array.isArray(test)) {
            throw new ObjectError(expectedType);
        }
        Object.entries(test).forEach(function (_a) {
            var key = _a[0], val = _a[1];
            var expectedValueType = type[key];
            // val is a constant enum
            if (typeof expectedValueType === 'object') {
                return validateConstantEnum(val, expectedValueType);
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
function validateString(value) {
    if (isEmptyValue(value)) {
        return;
    }
    try {
        var parsedValue = parseJSON(value);
        if (typeof parsedValue === 'object') {
            throw new SyntaxError('debug.invalidValue', { cause: { expectedValues: 'string | undefined' } });
        }
    }
    catch (e) {
        // Only propagate error if value is a string representation of an object or array
        if (e.cause) {
            throw e;
        }
    }
}
/**
 * Execute validation of a union type (e.g. Record<string, string> | Array<string>)
 */
function unionValidation(firstValidation, secondValidation) {
    try {
        firstValidation();
    }
    catch (e) {
        secondValidation();
    }
}
/**
 * Validates if a property of Report is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateReportDraftProperty(key, value) {
    if (REPORT_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'avatarUrl':
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
        case 'isCancelledIOU':
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
            return validateNumber(value);
        case 'chatType':
            return validateConstantEnum(value, CONST_1.default.REPORT.CHAT_TYPE);
        case 'stateNum':
            return validateConstantEnum(value, CONST_1.default.REPORT.STATE_NUM);
        case 'statusNum':
            return validateConstantEnum(value, CONST_1.default.REPORT.STATUS_NUM);
        case 'writeCapability':
            return validateConstantEnum(value, CONST_1.default.REPORT.WRITE_CAPABILITIES);
        case 'visibility':
            return validateConstantEnum(value, CONST_1.default.REPORT.VISIBILITY);
        case 'invoiceReceiver':
            return validateObject(value, {
                type: 'string',
                policyID: 'string',
                accountID: 'string',
            });
        case 'lastActionType':
            return validateConstantEnum(value, CONST_1.default.REPORT.ACTIONS.TYPE);
        case 'participants':
            return validateObject(value, {
                role: CONST_1.default.REPORT.ROLE,
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                pendingFields: 'object',
                notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE,
                permissions: 'array',
            }, 'number');
        case 'errorFields':
            return validateObject(value, {}, 'string');
        case 'errors':
            return validateObject(value, {});
        case 'privateNotes':
            return validateObject(value, {
                note: 'string',
                errors: 'string',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                pendingFields: 'object',
            }, 'number');
        case 'fieldList':
            return validateObject(value, {
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
            }, 'string');
        case 'permissions':
            return validateArray(value, CONST_1.default.REPORT.PERMISSIONS);
        case 'tripData':
            return validateObject(value, {
                startDate: 'string',
                endDate: 'string',
                tripID: 'string',
                payload: 'object',
            });
        case 'calendlySchedule':
            return validateObject(value, {
                isLoading: 'boolean',
                data: 'object',
                errors: 'object',
            });
        case 'calendlyCalls':
            return validateArray(value, {
                status: 'string',
                host: 'number',
                eventTime: 'string',
                eventURI: 'string',
                inserted: 'string',
            });
        case 'agentZeroProcessingRequestIndicator':
            return validateString(value);
        case 'pendingAction':
            return validateConstantEnum(value, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
            return validateObject(value, {
                description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                privateNotes: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                currency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                type: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                policyID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                avatarUrl: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                chatType: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                hasOutstandingChildRequest: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                hasOutstandingChildTask: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isOwnPolicyExpenseChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isPinned: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastMessageText: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastVisibleActionCreated: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastReadTime: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastReadSequenceNumber: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastMentionedTime: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                policyAvatar: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                policyName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                oldPolicyName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                hasParentAccess: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isDeletedParentAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                chatReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                stateNum: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                statusNum: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                writeCapability: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                visibility: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                invoiceReceiver: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportActionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                managerID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastVisibleActionLastModified: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastMessageHtml: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastActorAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastActionType: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                ownerAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                participants: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                total: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                unheldTotal: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                unheldNonReimbursableTotal: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isWaitingOnBankAccount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isCancelledIOU: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                iouReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                preexistingReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                nonReimbursableTotal: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                fieldList: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                permissions: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                tripData: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                private_isArchived: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                addWorkspaceRoom: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                avatar: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                partial: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reimbursed: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                preview: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                welcomeMessage: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                errors: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                createReport: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                exportFailedTime: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                calendlySchedule: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                calendlyCalls: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                agentZeroProcessingRequestIndicator: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
            });
    }
}
/**
 * Validates if a property of ReportAction is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateReportActionDraftProperty(key, value) {
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
            return validateObject(value, {});
        case 'pendingAction':
            return validateConstantEnum(value, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
            return validateObject(value, {
                reportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reportActionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                parentReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                errors: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                sequenceNumber: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                actionName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                actorAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                actor: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                person: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                created: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isLoading: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                avatar: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                automatic: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                shouldShow: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childReportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childType: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                accountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childOldestFourAccountIDs: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childCommenterCount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childLastVisibleActionCreated: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childVisibleActionCount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childManagerAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childOwnerAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childStatusNum: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childStateNum: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childLastMoneyRequestComment: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childLastActorAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childMoneyRequestCount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isFirstItem: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isAttachmentOnly: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isAttachmentWithText: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                receipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                lastModified: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                delegateAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                error: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childRecentReceiptTransactionIDs: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                linkMetadata: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                childReportNotificationPreference: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isNewestReportAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isOptimisticAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                adminAccountID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                whisperedToAccountIDs: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reportActionTimestamp: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                timestamp: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
            });
        case 'actionName':
            return validateConstantEnum(value, CONST_1.default.REPORT.ACTIONS.TYPE);
        case 'person':
            return validateArray(value, {
                type: 'string',
                text: 'string',
                style: 'string',
            });
        case 'childStatusNum':
            return validateConstantEnum(value, CONST_1.default.REPORT.STATUS_NUM);
        case 'childStateNum':
            return validateConstantEnum(value, CONST_1.default.REPORT.STATE_NUM);
        case 'receipt':
            return validateObject(value, {
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
            return validateObject(value, {}, 'string');
        case 'linkMetadata':
            return validateArray(value, {
                url: 'string',
                image: 'object',
                description: 'string',
                title: 'string',
                publisher: 'string',
                logo: 'object',
            });
        case 'childReportNotificationPreference':
            return validateConstantEnum(value, CONST_1.default.REPORT.NOTIFICATION_PREFERENCE);
        case 'whisperedToAccountIDs':
            return validateArray(value, 'number');
        case 'message':
            return unionValidation(function () {
                return validateArray(value, {
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
                    resolution: __assign(__assign({}, CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION), CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION),
                    deleted: 'string',
                });
            }, function () {
                return validateObject(value, {
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
                    resolution: __assign(__assign({}, CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION), CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION),
                    deleted: 'string',
                });
            });
        case 'originalMessage':
            return validateObject(value, {});
        case 'previousMessage':
            return unionValidation(function () {
                return validateObject(value, {
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
                });
            }, function () {
                return validateArray(value, {
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
                });
            });
    }
}
/**
 * Validates if a property of Transaction is of the expected type
 *
 * @param key - property key
 * @param value - value provided by the user
 */
function validateTransactionDraftProperty(key, value) {
    if (TRANSACTION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'reportID':
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
            return validateNumber(value);
        case 'iouRequestType':
            return validateConstantEnum(value, CONST_1.default.IOU.REQUEST_TYPE);
        case 'participants':
            return validateArray(value, {
                accountID: 'number',
                login: 'string',
                displayName: 'string',
                isPolicyExpenseChat: 'boolean',
                isInvoiceRoom: 'boolean',
                isOwnPolicyExpenseChat: 'boolean',
                chatType: CONST_1.default.REPORT.CHAT_TYPE,
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
                iouType: CONST_1.default.IOU.TYPE,
                ownerAccountID: 'number',
                icons: 'array',
                avatar: 'string',
                item: 'string',
            });
        case 'errors':
            return validateObject(value, {});
        case 'errorFields':
            return validateObject(value, {
                route: 'object',
            }, 'string');
        case 'pendingAction':
            return validateConstantEnum(value, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION);
        case 'pendingFields':
            return validateObject(value, {
                attributes: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                subRates: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                comment: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                hold: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isLoading: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                type: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                customUnit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                source: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                originalTransactionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                splits: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                dismissedViolations: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                customUnitID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                customUnitRateID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                quantity: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                name: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                defaultP2PRate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                distanceUnit: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                attendees: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                amount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                taxAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                taxCode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                billable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                category: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                created: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                currency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                errors: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                filename: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                iouRequestType: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                merchant: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedAttendees: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedCreated: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedCurrency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedMerchant: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedWaypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                participantsAutoAssigned: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                participants: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                receipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                routes: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                transactionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                tag: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                isFromGlobalCreate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                taxRate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                parentTransactionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                reimbursable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                cardID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                status: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                hasEReceipt: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                mccGroup: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                modifiedMCCGroup: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                originalAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                originalCurrency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                splitShares: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                splitPayerAccountIDs: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                shouldShowOriginalAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                actionableWhisperReportActionID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                linkedTrackedExpenseReportAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                linkedTrackedExpenseReportID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                bank: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                liabilityType: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                cardName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                cardNumber: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                managedCard: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                posted: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                inserted: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                accountant: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                splitExpenses: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
            }, 'string');
        case 'receipt':
            return validateObject(value, {
                type: 'string',
                source: 'string',
                name: 'string',
                filename: 'string',
                state: CONST_1.default.IOU.RECEIPT_STATE,
                receiptID: 'number',
                reservationList: 'array',
                isTestReceipt: 'boolean',
                isTestDriveReceipt: 'boolean',
            });
        case 'taxRate':
            return validateObject(value, {
                keyForList: 'string',
                text: 'string',
                data: 'object',
            });
        case 'status':
            return validateConstantEnum(value, CONST_1.default.TRANSACTION.STATUS);
        case 'comment':
            return validateObject(value, {
                comment: 'string',
                hold: 'string',
                waypoints: 'object',
                attendees: 'array',
                isLoading: 'boolean',
                type: CONST_1.default.TRANSACTION.TYPE,
                customUnit: 'object',
                source: 'string',
                originalTransactionID: 'string',
                liabilityType: CONST_1.default.TRANSACTION.LIABILITY_TYPE,
                splits: 'array',
                dismissedViolations: 'object',
                splitExpenses: 'array',
            });
        case 'accountant':
            return validateObject(value, {
                accountID: 'number',
                login: 'string',
            });
        case 'modifiedAttendees':
            return validateArray(value, {
                email: 'string',
                displayName: 'string',
                avatarUrl: 'string',
                accountID: 'number',
                text: 'string',
                login: 'string',
                searchText: 'string',
                selected: 'boolean',
                iouType: CONST_1.default.IOU.TYPE,
                reportID: 'string',
            });
        case 'modifiedWaypoints':
            return validateObject(value, {
                name: 'string',
                address: 'string',
                lat: 'number',
                lng: 'number',
                keyForList: 'string',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                street: 'string',
                city: 'string',
                state: 'string',
                zipCode: 'string',
                country: 'string',
                street2: 'string',
            }, 'string');
        case 'routes':
            return validateObject(value, {
                distance: 'number',
                geometry: 'object',
            }, 'string');
        case 'mccGroup':
            return validateConstantEnum(value, CONST_1.default.MCC_GROUPS);
        case 'modifiedMCCGroup':
            return validateConstantEnum(value, CONST_1.default.MCC_GROUPS);
        case 'splitShares':
            return validateObject(value, {
                amount: 'number',
                isModified: 'boolean',
            }, 'number');
        case 'splitPayerAccountIDs':
            return validateArray(value, 'number');
        case 'linkedTrackedExpenseReportAction':
            return validateObject(value, {
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
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION,
                pendingFields: 'object',
                sequenceNumber: 'number',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE,
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
                childStatusNum: CONST_1.default.REPORT.STATUS_NUM,
                childStateNum: CONST_1.default.REPORT.STATE_NUM,
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
                childReportNotificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE,
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
function validateTransactionViolationDraftProperty(key, value) {
    if (TRANSACTION_VIOLATION_REQUIRED_PROPERTIES.includes(key) && isEmptyValue(value)) {
        throw SyntaxError('debug.missingValue');
    }
    switch (key) {
        case 'type':
            return validateConstantEnum(value, CONST_1.default.VIOLATION_TYPES);
        case 'name':
            return validateConstantEnum(value, CONST_1.default.VIOLATIONS);
        case 'data':
            return validateObject(value, {
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
                type: CONST_1.default.MODIFIED_AMOUNT_VIOLATION_DATA,
                displayPercentVariance: 'number',
                duplicates: 'array',
                rterType: CONST_1.default.RTER_VIOLATION_TYPES,
                tooltip: 'string',
                message: 'string',
                field: 'string',
                prohibitedExpenseRule: 'string',
            });
        case 'showInReview':
            return validateBoolean(value);
    }
}
/**
 * Validates if the ReportAction JSON that the user provided is of the expected type
 */
function validateReportActionJSON(json) {
    var parsedReportAction = parseJSON(json);
    REPORT_ACTION_REQUIRED_PROPERTIES.forEach(function (key) {
        if (parsedReportAction[key] !== undefined) {
            return;
        }
        throw new SyntaxError('debug.missingProperty', { cause: { propertyName: key } });
    });
    Object.entries(parsedReportAction).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        try {
            if (!isEmptyValue(val) && REPORT_ACTION_NUMBER_PROPERTIES.includes(key) && typeof val !== 'number') {
                throw new NumberError();
            }
            validateReportActionDraftProperty(key, onyxDataToString(val));
        }
        catch (e) {
            var cause = e.cause;
            throw new SyntaxError('debug.invalidProperty', { cause: { propertyName: key, expectedType: cause.expectedValues } });
        }
    });
}
function validateTransactionViolationJSON(json) {
    var parsedTransactionViolation = parseJSON(json);
    TRANSACTION_VIOLATION_REQUIRED_PROPERTIES.forEach(function (key) {
        if (parsedTransactionViolation[key] !== undefined) {
            return;
        }
        throw new SyntaxError('debug.missingProperty', { cause: { propertyName: key } });
    });
    Object.entries(parsedTransactionViolation).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        try {
            validateTransactionViolationDraftProperty(key, onyxDataToString(val));
        }
        catch (e) {
            var cause = e.cause;
            throw new SyntaxError('debug.invalidProperty', { cause: { propertyName: key, expectedType: cause.expectedValues } });
        }
    });
}
/**
 * Gets the reason for showing LHN row
 */
function getReasonForShowingRowInLHN(report, chatReport, hasRBR, isReportArchived) {
    if (hasRBR === void 0) { hasRBR = false; }
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!report) {
        return null;
    }
    var doesReportHaveViolations = (0, ReportUtils_1.shouldDisplayViolationsRBRInLHN)(report, transactionViolations);
    var reason = (0, ReportUtils_1.reasonForReportToBeInOptionList)({
        report: report,
        chatReport: chatReport,
        // We can't pass report.reportID because it will cause reason to always be isFocused
        currentReportId: '-1',
        isInFocusMode: !!isInFocusMode,
        betas: betas,
        excludeEmptyChats: true,
        doesReportHaveViolations: doesReportHaveViolations,
        includeSelfDM: true,
        isReportArchived: isReportArchived,
    });
    if (![CONST_1.default.REPORT_IN_LHN_REASONS.HAS_ADD_WORKSPACE_ROOM_ERRORS, CONST_1.default.REPORT_IN_LHN_REASONS.HAS_IOU_VIOLATIONS].includes(reason) && hasRBR) {
        return "debug.reasonVisibleInLHN.hasRBR";
    }
    // When there's no specific reason, we default to isFocused if the report is only showing because we're viewing it
    // Otherwise we return hasRBR if the report has errors other that failed receipt
    if (reason === null || reason === CONST_1.default.REPORT_IN_LHN_REASONS.DEFAULT) {
        return 'debug.reasonVisibleInLHN.isFocused';
    }
    return "debug.reasonVisibleInLHN.".concat(reason);
}
/**
 * Gets the reason and report action that is causing the GBR to show up in LHN row
 */
function getReasonAndReportActionForGBRInLHNRow(report, isReportArchived) {
    var _a;
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!report) {
        return null;
    }
    var _b = (_a = (0, ReportUtils_1.getReasonAndReportActionThatRequiresAttention)(report, undefined, isReportArchived)) !== null && _a !== void 0 ? _a : {}, reason = _b.reason, reportAction = _b.reportAction;
    if (reason) {
        return { reason: "debug.reasonGBR.".concat(reason), reportAction: reportAction };
    }
    return null;
}
/**
 * Gets the report action that is causing the RBR to show up in LHN
 */
function getReasonAndReportActionForRBRInLHNRow(report, chatReport, reportActions, transactions, hasViolations, reportErrors, isArchivedReport) {
    var _a;
    if (isArchivedReport === void 0) { isArchivedReport = false; }
    var _b = (_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(report, chatReport, reportActions, hasViolations, reportErrors, transactions, transactionViolations, isArchivedReport)) !== null && _a !== void 0 ? _a : {}, reason = _b.reason, reportAction = _b.reportAction;
    if (reason) {
        return { reason: "debug.reasonRBR.".concat(reason), reportAction: reportAction };
    }
    return null;
}
function getTransactionID(report, reportActions) {
    var transactionID = (0, TransactionUtils_1.getTransactionID)(report === null || report === void 0 ? void 0 : report.reportID);
    return Number(transactionID) > 0
        ? transactionID
        : Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})
            .map(function (reportAction) { return (0, ReportActionsUtils_1.getLinkedTransactionID)(reportAction); })
            .find(Boolean);
}
var DebugUtils = {
    stringifyJSON: stringifyJSON,
    onyxDataToDraftData: onyxDataToDraftData,
    onyxDataToString: onyxDataToString,
    stringToOnyxData: stringToOnyxData,
    compareStringWithOnyxData: compareStringWithOnyxData,
    getNumberOfLinesFromString: getNumberOfLinesFromString,
    validateNumber: validateNumber,
    validateBoolean: validateBoolean,
    validateDate: validateDate,
    validateConstantEnum: validateConstantEnum,
    validateArray: validateArray,
    validateObject: validateObject,
    validateString: validateString,
    validateReportDraftProperty: validateReportDraftProperty,
    validateReportActionDraftProperty: validateReportActionDraftProperty,
    validateTransactionDraftProperty: validateTransactionDraftProperty,
    validateTransactionViolationDraftProperty: validateTransactionViolationDraftProperty,
    validateReportActionJSON: validateReportActionJSON,
    validateTransactionViolationJSON: validateTransactionViolationJSON,
    getReasonForShowingRowInLHN: getReasonForShowingRowInLHN,
    getReasonAndReportActionForGBRInLHNRow: getReasonAndReportActionForGBRInLHNRow,
    getReasonAndReportActionForRBRInLHNRow: getReasonAndReportActionForRBRInLHNRow,
    getTransactionID: getTransactionID,
    REPORT_ACTION_REQUIRED_PROPERTIES: REPORT_ACTION_REQUIRED_PROPERTIES,
    REPORT_REQUIRED_PROPERTIES: REPORT_REQUIRED_PROPERTIES,
    TRANSACTION_REQUIRED_PROPERTIES: TRANSACTION_REQUIRED_PROPERTIES,
};
exports.default = DebugUtils;
