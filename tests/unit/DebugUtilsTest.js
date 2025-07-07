"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var DateUtils_1 = require("@libs/DateUtils");
var DebugUtils_1 = require("@libs/DebugUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../../__mocks__/reportData/reports");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_2 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var MOCK_REPORT = __assign({}, (0, reports_2.createRandomReport)(0));
var MOCK_REPORT_ACTION = __assign(__assign({}, (0, reportActions_1.default)(0)), { originalMessage: undefined });
var MOCK_TRANSACTION = (0, transaction_1.default)(0);
var MOCK_DRAFT_REPORT_ACTION = DebugUtils_1.default.onyxDataToString(MOCK_REPORT_ACTION);
var MOCK_CONST_ENUM = {
    foo: 'foo',
    bar: 'bar',
};
var TEST_OBJECT = {
    a: 1,
    b: 'a',
    c: [],
    d: {},
    e: true,
    f: false,
};
var TEST_OBJECT_TYPE = {
    a: 'number',
    b: 'string',
    c: 'array',
    d: 'object',
    e: 'boolean',
    f: 'boolean',
};
describe('DebugUtils', function () {
    describe('onyxDataToString', function () {
        it('returns "undefined" when data is undefined', function () {
            expect(DebugUtils_1.default.onyxDataToString(undefined)).toBe('undefined');
        });
        it('returns JSON string when data is an object', function () {
            expect(DebugUtils_1.default.onyxDataToString(MOCK_REPORT_ACTION)).toBe(MOCK_DRAFT_REPORT_ACTION);
        });
        it('returns string when data is string', function () {
            expect(DebugUtils_1.default.onyxDataToString(2)).toBe('2');
        });
    });
    describe('stringToOnyxData', function () {
        it('returns number when type is number', function () {
            expect(DebugUtils_1.default.stringToOnyxData('2', 'number')).toBe(2);
        });
        it('returns object when type is object', function () {
            expect(DebugUtils_1.default.stringToOnyxData('{\n      "a": 2\n}', 'object')).toEqual({ a: 2 });
        });
        it('returns true when type is boolean and data is "true"', function () {
            expect(DebugUtils_1.default.stringToOnyxData('true', 'boolean')).toBe(true);
        });
        it('returns false when type is boolean and data is "false"', function () {
            expect(DebugUtils_1.default.stringToOnyxData('false', 'boolean')).toBe(false);
        });
        it('returns null when type is undefined', function () {
            expect(DebugUtils_1.default.stringToOnyxData('2', 'undefined')).toBe(null);
        });
        it('returns string when type is string', function () {
            expect(DebugUtils_1.default.stringToOnyxData('2', 'string')).toBe('2');
        });
        it('returns string when type is not specified', function () {
            expect(DebugUtils_1.default.stringToOnyxData('2')).toBe('2');
        });
    });
    describe('compareStringWithOnyxData', function () {
        it('returns true when data is undefined and text is "undefined"', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData('undefined', undefined)).toBe(true);
        });
        it('returns false when data is undefined and text is not "undefined"', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData('A', undefined)).toBe(false);
        });
        it('returns true when data is object and text is data in JSON format', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData(MOCK_DRAFT_REPORT_ACTION, MOCK_REPORT_ACTION)).toBe(true);
        });
        it('returns false when data is object and text is not data in JSON format', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData('{}', MOCK_REPORT_ACTION)).toBe(false);
        });
        it('returns true when data is string and text equals to data', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData('A', 'A')).toBe(true);
        });
        it('returns false when data is string and text is not equal to data', function () {
            expect(DebugUtils_1.default.compareStringWithOnyxData('2', 'A')).toBe(false);
        });
    });
    describe('getNumberOfLinesFromString', function () {
        it('returns 1 when string is empty', function () {
            expect(DebugUtils_1.default.getNumberOfLinesFromString('')).toBe(1);
        });
        it('returns 1 when no "\\n" are present in the string', function () {
            expect(DebugUtils_1.default.getNumberOfLinesFromString('Something something something')).toBe(1);
        });
        it('returns k when there are k - 1 "\\n" present in the string', function () {
            expect(DebugUtils_1.default.getNumberOfLinesFromString('Line1\n Line2\nLine3')).toBe(3);
        });
    });
    describe('validateNumber', function () {
        it('does not throw SyntaxError when value is "undefined"', function () {
            expect(function () {
                DebugUtils_1.default.validateNumber('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a number', function () {
            expect(function () {
                DebugUtils_1.default.validateNumber('1');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is an empty string', function () {
            expect(function () {
                DebugUtils_1.default.validateNumber('');
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid number', function () {
            expect(function () {
                DebugUtils_1.default.validateNumber('A');
            }).toThrow();
        });
    });
    describe('validateBoolean', function () {
        it('does not throw SyntaxError when value is "undefined"', function () {
            expect(function () {
                DebugUtils_1.default.validateBoolean('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of true', function () {
            expect(function () {
                DebugUtils_1.default.validateBoolean('true');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of false', function () {
            expect(function () {
                DebugUtils_1.default.validateBoolean('false');
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a boolean', function () {
            expect(function () {
                DebugUtils_1.default.validateBoolean('1');
            }).toThrow();
        });
    });
    describe('validateDate', function () {
        it('does not throw SyntaxError when value is "undefined"', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a date', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-08 18:20:44.171');
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - number', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('1');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid year', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('20-08-08 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid month', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-14-08 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid day', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-40 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid hour', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-08 32:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid minutes', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-08 18:70:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid seconds', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-08 18:20:70.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid milliseconds', function () {
            expect(function () {
                DebugUtils_1.default.validateDate('2024-08-08 18:20:44.1710');
            }).toThrow();
        });
    });
    describe('validateConstantEnum', function () {
        it('does not throw SyntaxError when value is "undefined"', function () {
            expect(function () {
                DebugUtils_1.default.validateConstantEnum('undefined', MOCK_CONST_ENUM);
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is an empty string', function () {
            expect(function () {
                DebugUtils_1.default.validateConstantEnum('', MOCK_CONST_ENUM);
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a constant enum', function () {
            expect(function () {
                DebugUtils_1.default.validateConstantEnum('foo', MOCK_CONST_ENUM);
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a constant enum', function () {
            expect(function () {
                DebugUtils_1.default.validateConstantEnum('1', MOCK_CONST_ENUM);
            }).toThrow();
        });
    });
    describe('validateArray', function () {
        it('does not throw SyntaxError when value is "undefined"', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('undefined', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a string representation of an empty array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('[]', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a number array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('[1]', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a string array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('["a"]', 'string');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of an object array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray(DebugUtils_1.default.onyxDataToString([TEST_OBJECT]), TEST_OBJECT_TYPE);
            }).not.toThrow();
        });
        it('throws SyntaxError when value is just a string', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('a', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is a string representation of an object', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('{}', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a number array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('["a"]', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a string array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('[1]', 'string');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a constant enum array', function () {
            expect(function () {
                DebugUtils_1.default.validateArray('["a"]', MOCK_CONST_ENUM);
            }).toThrow();
        });
        it('throws SyntaxError when value is a valid string representation of an object array but it has an invalid property type', function () {
            expect(function () {
                DebugUtils_1.default.validateArray(DebugUtils_1.default.onyxDataToString([
                    {
                        c: 'a',
                    },
                ]), {
                    c: ['number', 'undefined'],
                });
            }).toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of an object array and has valid property types', function () {
            expect(function () {
                DebugUtils_1.default.validateArray(DebugUtils_1.default.onyxDataToString([
                    {
                        c: 2,
                    },
                ]), {
                    c: ['number', 'undefined'],
                });
            }).not.toThrow();
        });
        it("throws SyntaxError when value is a valid string representation of an object array but there's a property type which is not an array as expected", function () {
            expect(function () {
                DebugUtils_1.default.validateArray(DebugUtils_1.default.onyxDataToString([
                    {
                        c: 2,
                    },
                ]), {
                    c: 'array',
                });
            }).toThrow();
        });
    });
    describe('validateObject', function () {
        describe('value is undefined', function () {
            it('does not throw SyntaxError', function () {
                expect(function () {
                    DebugUtils_1.default.validateObject('undefined', {});
                }).not.toThrow();
            });
        });
        describe('value is null', function () {
            it('does not throw SyntaxError', function () {
                expect(function () {
                    DebugUtils_1.default.validateObject('null', {});
                }).not.toThrow();
            });
        });
        describe('value is a JSON representation of an object', function () {
            describe('object is valid', function () {
                it('does not throw SyntaxError', function () {
                    expect(function () {
                        DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString(TEST_OBJECT), TEST_OBJECT_TYPE);
                    }).not.toThrow();
                });
            });
            describe('object has an invalid property', function () {
                it('throws SyntaxError', function () {
                    expect(function () {
                        DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString({
                            a: 'a',
                            b: 'a',
                            c: [],
                            d: {},
                            e: true,
                            f: false,
                        }), TEST_OBJECT_TYPE);
                    }).toThrow();
                });
            });
            describe('object is a collection', function () {
                describe('collection index type is invalid', function () {
                    it('throws SyntaxError', function () {
                        expect(function () {
                            DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString({
                                a: {
                                    foo: 'bar',
                                },
                            }), {
                                foo: 'string',
                            }, 'number');
                        }).toThrow();
                    });
                });
                describe('collection index type is valid', function () {
                    describe('collection value type is not valid', function () {
                        it('throws SyntaxError', function () {
                            expect(function () {
                                DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString({
                                    a: [1, 2, 3],
                                }), {
                                    foo: 'string',
                                }, 'string');
                            }).toThrow();
                        });
                    });
                });
            });
        });
        describe('value is a JSON representation of an array', function () {
            it('throws SyntaxError', function () {
                expect(function () {
                    DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString([TEST_OBJECT]), TEST_OBJECT_TYPE);
                }).toThrow();
            });
        });
        describe('JSON contains an invalid property', function () {
            it('throws SyntaxError', function () {
                expect(function () {
                    DebugUtils_1.default.validateObject(DebugUtils_1.default.onyxDataToString({
                        a: 'a',
                        b: 'a',
                        c: [],
                        d: {},
                        e: true,
                        f: false,
                    }), TEST_OBJECT_TYPE);
                }).toThrow();
            });
        });
    });
    describe('validateString', function () {
        describe('value is undefined', function () {
            it('does not throw SyntaxError"', function () {
                expect(function () {
                    DebugUtils_1.default.validateString('undefined');
                }).not.toThrow();
            });
        });
    });
    describe('validateReportDraftProperty', function () {
        describe.each(Object.keys(MOCK_REPORT))('%s', function (key) {
            describe('is undefined', function () {
                it("".concat(DebugUtils_1.default.REPORT_REQUIRED_PROPERTIES.includes(key) ? 'throws SyntaxError' : 'does not throw SyntaxError'), function () {
                    if (DebugUtils_1.default.REPORT_REQUIRED_PROPERTIES.includes(key)) {
                        expect(function () {
                            DebugUtils_1.default.validateReportDraftProperty(key, 'undefined');
                        }).toThrow();
                    }
                    else {
                        expect(function () {
                            DebugUtils_1.default.validateReportDraftProperty(key, 'undefined');
                        }).not.toThrow();
                    }
                });
            });
            describe('is invalid', function () {
                it('throws SyntaxError', function () {
                    var value = MOCK_REPORT[key];
                    var invalidValue;
                    switch (typeof value) {
                        case 'number':
                            invalidValue = 'a';
                            break;
                        case 'boolean':
                        case 'object':
                            invalidValue = 2;
                            break;
                        default:
                            invalidValue = [];
                    }
                    expect(function () {
                        DebugUtils_1.default.validateReportDraftProperty(key, DebugUtils_1.default.onyxDataToString(invalidValue));
                    }).toThrow();
                });
            });
            describe('is valid', function () {
                it('does not throw SyntaxError', function () {
                    expect(function () {
                        DebugUtils_1.default.validateReportDraftProperty(key, DebugUtils_1.default.onyxDataToString(MOCK_REPORT[key]));
                    }).not.toThrow();
                });
            });
        });
    });
    describe('validateReportActionDraftProperty', function () {
        describe.each(Object.keys(MOCK_REPORT_ACTION))('%s', function (key) {
            it("".concat(DebugUtils_1.default.REPORT_ACTION_REQUIRED_PROPERTIES.includes(key) ? "throws SyntaxError when 'undefined'" : 'does not throw SyntaxError when "undefined"'), function () {
                if (DebugUtils_1.default.REPORT_ACTION_REQUIRED_PROPERTIES.includes(key)) {
                    expect(function () {
                        DebugUtils_1.default.validateReportActionDraftProperty(key, 'undefined');
                    }).toThrow();
                }
                else {
                    expect(function () {
                        DebugUtils_1.default.validateReportActionDraftProperty(key, 'undefined');
                    }).not.toThrow();
                }
            });
            it('throws SyntaxError when invalid', function () {
                var value = MOCK_REPORT_ACTION[key];
                var invalidValue;
                switch (typeof value) {
                    case 'number':
                        invalidValue = 'a';
                        break;
                    case 'boolean':
                    case 'object':
                        invalidValue = 2;
                        break;
                    default:
                        invalidValue = [];
                }
                expect(function () {
                    DebugUtils_1.default.validateReportActionDraftProperty(key, DebugUtils_1.default.onyxDataToString(invalidValue));
                }).toThrow();
            });
            it('does not throw SyntaxError when valid', function () {
                expect(function () {
                    DebugUtils_1.default.validateReportActionDraftProperty(key, DebugUtils_1.default.onyxDataToString(MOCK_REPORT_ACTION[key]));
                }).not.toThrow();
            });
        });
    });
    describe('validateTransactionDraftProperty', function () {
        describe.each(Object.keys(MOCK_TRANSACTION))('%s', function (key) {
            it("".concat(DebugUtils_1.default.TRANSACTION_REQUIRED_PROPERTIES.includes(key) ? "throws SyntaxError when 'undefined'" : 'does not throw SyntaxError when "undefined"'), function () {
                if (DebugUtils_1.default.TRANSACTION_REQUIRED_PROPERTIES.includes(key)) {
                    expect(function () {
                        DebugUtils_1.default.validateTransactionDraftProperty(key, 'undefined');
                    }).toThrow();
                }
                else {
                    expect(function () {
                        DebugUtils_1.default.validateTransactionDraftProperty(key, 'undefined');
                    }).not.toThrow();
                }
            });
            it('throws SyntaxError when invalid', function () {
                var value = MOCK_TRANSACTION[key];
                var invalidValue;
                switch (typeof value) {
                    case 'number':
                        invalidValue = 'a';
                        break;
                    case 'boolean':
                    case 'object':
                        invalidValue = 2;
                        break;
                    default:
                        invalidValue = [];
                }
                expect(function () {
                    DebugUtils_1.default.validateTransactionDraftProperty(key, DebugUtils_1.default.onyxDataToString(invalidValue));
                }).toThrow();
            });
            it('does not throw SyntaxError when valid', function () {
                expect(function () {
                    DebugUtils_1.default.validateTransactionDraftProperty(key, DebugUtils_1.default.onyxDataToString(MOCK_TRANSACTION[key]));
                }).not.toThrow();
            });
        });
    });
    describe('validateReportActionJSON', function () {
        it('does not throw SyntaxError when valid', function () {
            expect(function () {
                DebugUtils_1.default.validateReportActionJSON(MOCK_DRAFT_REPORT_ACTION);
            }).not.toThrow();
        });
        it('throws SyntaxError when property is not a valid number', function () {
            var reportAction = __assign(__assign({}, MOCK_REPORT_ACTION), { accountID: '2' });
            var draftReportAction = DebugUtils_1.default.onyxDataToString(reportAction);
            expect(function () {
                DebugUtils_1.default.validateReportActionJSON(draftReportAction);
            }).toThrow(new SyntaxError('debug.invalidProperty', {
                cause: {
                    propertyName: 'accountID',
                    expectedType: 'number | undefined',
                },
            }));
        });
        it('throws SyntaxError when property is not a valid date', function () {
            var reportAction = __assign(__assign({}, MOCK_REPORT_ACTION), { created: 2 });
            var draftReportAction = DebugUtils_1.default.onyxDataToString(reportAction);
            expect(function () {
                DebugUtils_1.default.validateReportActionJSON(draftReportAction);
            }).toThrow(new SyntaxError('debug.invalidProperty', {
                cause: {
                    propertyName: 'created',
                    expectedType: CONST_1.default.DATE.FNS_DB_FORMAT_STRING,
                },
            }));
        });
        it('throws SyntaxError when property is not a valid boolean', function () {
            var reportAction = __assign(__assign({}, MOCK_REPORT_ACTION), { isLoading: 2 });
            var draftReportAction = DebugUtils_1.default.onyxDataToString(reportAction);
            expect(function () {
                DebugUtils_1.default.validateReportActionJSON(draftReportAction);
            }).toThrow(new SyntaxError('debug.invalidProperty', {
                cause: {
                    propertyName: 'isLoading',
                    expectedType: 'true | false | undefined',
                },
            }));
        });
        it('throws SyntaxError when property is missing', function () {
            var reportAction = __assign(__assign({}, MOCK_REPORT_ACTION), { actionName: undefined });
            var draftReportAction = DebugUtils_1.default.onyxDataToString(reportAction);
            expect(function () {
                DebugUtils_1.default.validateReportActionJSON(draftReportAction);
            }).toThrow(new SyntaxError('debug.missingProperty', {
                cause: {
                    propertyName: 'actionName',
                },
            }));
        });
    });
    describe('getReasonForShowingRowInLHN', function () {
        var baseReport = {
            reportID: '1',
            type: CONST_1.default.REPORT.TYPE.CHAT,
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM,
            reportName: 'My first chat',
            lastMessageText: 'Hello World!',
        };
        beforeAll(function () {
            react_native_onyx_1.default.init({
                keys: ONYXKEYS_1.default,
            });
        });
        beforeEach(function () {
            react_native_onyx_1.default.clear();
        });
        it('returns null when report is not defined', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(undefined, reports_1.chatReportR14932);
            expect(reason).toBeNull();
        });
        it('returns correct reason when report has a valid draft comment', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT, "1"), 'Hello world!')];
                    case 1:
                        _a.sent();
                        reason = DebugUtils_1.default.getReasonForShowingRowInLHN(baseReport, reports_1.chatReportR14932);
                        expect(reason).toBe('debug.reasonVisibleInLHN.hasDraftComment');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report has GBR', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign(__assign({}, baseReport), { lastMentionedTime: '2024-08-10 18:70:44.171', lastReadTime: '2024-08-08 18:70:44.171' }), reports_1.chatReportR14932);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasGBR');
        });
        it('returns correct reason when report is pinned', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign(__assign({}, baseReport), { isPinned: true }), reports_1.chatReportR14932);
            expect(reason).toBe('debug.reasonVisibleInLHN.pinnedByUser');
        });
        it('returns correct reason when report has add workspace room errors', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign(__assign({}, baseReport), { errorFields: {
                    addWorkspaceRoom: {
                        error: 'Something happened',
                    },
                } }), reports_1.chatReportR14932);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasAddWorkspaceRoomErrors');
        });
        it('returns correct reason when report is unread', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.GSD)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, {
                                accountID: 1234,
                            })];
                    case 2:
                        _a.sent();
                        reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign(__assign({}, baseReport), { participants: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                1234: {
                                    notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                                },
                            }, lastVisibleActionCreated: '2024-08-10 18:70:44.171', lastReadTime: '2024-08-08 18:70:44.171', lastMessageText: 'Hello world!' }), reports_1.chatReportR14932);
                        expect(reason).toBe('debug.reasonVisibleInLHN.isUnread');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report is archived', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportNameValuePairs, isReportArchived, reason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportNameValuePairs = {
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.DEFAULT)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(baseReport.reportID), reportNameValuePairs)];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(baseReport === null || baseReport === void 0 ? void 0 : baseReport.reportID); }).result;
                        reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign({}, baseReport), reports_1.chatReportR14932, false, isReportArchived.current);
                        expect(reason).toBe('debug.reasonVisibleInLHN.isArchived');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report is self DM', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(__assign(__assign({}, baseReport), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM }), reports_1.chatReportR14932);
            expect(reason).toBe('debug.reasonVisibleInLHN.isSelfDM');
        });
        it('returns correct reason when report is temporarily focused', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(baseReport, reports_1.chatReportR14932);
            expect(reason).toBe('debug.reasonVisibleInLHN.isFocused');
        });
        it('returns correct reason when report has one transaction thread with violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_TRANSACTION_REPORT, MOCK_REPORTS, MOCK_REPORT_ACTIONS, reason;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        MOCK_TRANSACTION_REPORT = {
                            reportID: '1',
                            ownerAccountID: 12345,
                            type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        };
                        MOCK_REPORTS = (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_TRANSACTION_REPORT,
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = {
                                reportID: '2',
                                type: CONST_1.default.REPORT.TYPE.CHAT,
                                parentReportID: '1',
                                parentReportActionID: '1',
                                stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                            },
                            _a);
                        MOCK_REPORT_ACTIONS = (_b = {},
                            _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                '1': {
                                    reportActionID: '1',
                                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                    actorAccountID: 12345,
                                    created: '2024-08-08 18:20:44.171',
                                    childReportID: '2',
                                    message: {
                                        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                                        amount: 10,
                                        currency: CONST_1.default.CURRENCY.USD,
                                        IOUReportID: '1',
                                        text: 'Vacation expense',
                                        IOUTransactionID: '1',
                                    },
                                },
                            },
                            _b);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, MOCK_REPORTS), MOCK_REPORT_ACTIONS), (_c = {}, _c[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                transactionID: '1',
                                amount: 10,
                                modifiedAmount: 10,
                                reportID: '1',
                            }, _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, "1")] = [
                                {
                                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                                    name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                                },
                            ], _c)))];
                    case 1:
                        _d.sent();
                        reason = DebugUtils_1.default.getReasonForShowingRowInLHN(MOCK_TRANSACTION_REPORT, reports_1.chatReportR14932, true);
                        expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report has violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_EXPENSE_REPORT, MOCK_REPORTS, MOCK_REPORT_ACTIONS, reason;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        MOCK_EXPENSE_REPORT = {
                            reportID: '1',
                            chatReportID: '2',
                            parentReportID: '2',
                            parentReportActionID: '1',
                            ownerAccountID: 12345,
                            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                            type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        };
                        MOCK_REPORTS = (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_EXPENSE_REPORT,
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = {
                                reportID: '2',
                                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            },
                            _a);
                        MOCK_REPORT_ACTIONS = (_b = {},
                            _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "2")] = {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                '1': {
                                    reportActionID: '1',
                                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                    actorAccountID: 12345,
                                    created: '2024-08-08 18:20:44.171',
                                    message: {
                                        type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                                        amount: 10,
                                        currency: CONST_1.default.CURRENCY.USD,
                                        IOUReportID: '1',
                                        text: 'Vacation expense',
                                        IOUTransactionID: '1',
                                    },
                                },
                            },
                            _b);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, MOCK_REPORTS), MOCK_REPORT_ACTIONS), (_c = {}, _c[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                transactionID: '1',
                                amount: 10,
                                modifiedAmount: 10,
                                reportID: '1',
                            }, _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, "1")] = [
                                {
                                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                                    name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                                },
                            ], _c)))];
                    case 1:
                        _d.sent();
                        reason = DebugUtils_1.default.getReasonForShowingRowInLHN(MOCK_EXPENSE_REPORT, reports_1.chatReportR14932, true);
                        expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report has errors', function () {
            var reason = DebugUtils_1.default.getReasonForShowingRowInLHN(baseReport, reports_1.chatReportR14932, true);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
        });
    });
    describe('getReasonAndReportActionForGBRInLHNRow', function () {
        beforeAll(function () {
            react_native_onyx_1.default.init({
                keys: ONYXKEYS_1.default,
            });
        });
        beforeEach(function () {
            react_native_onyx_1.default.clear();
        });
        it('returns undefined reason when report is not defined', function () {
            var _a;
            var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow(undefined)) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBeUndefined();
        });
        it('returns correct reason when report has a join request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT_ACTIONS, reason;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '0': {
                                reportActionID: '0',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
                                created: '2024-08-08 19:70:44.171',
                                message: {
                                    choice: '',
                                    policyID: '0',
                                },
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1"), MOCK_REPORT_ACTIONS)];
                    case 1:
                        _b.sent();
                        reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                            reportID: '1',
                        })) !== null && _a !== void 0 ? _a : {}).reason;
                        expect(reason).toBe('debug.reasonGBR.hasJoinRequest');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report is unread with mention', function () {
            var _a;
            var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                reportID: '1',
                lastMentionedTime: '2024-08-10 18:70:44.171',
                lastReadTime: '2024-08-08 18:70:44.171',
            })) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe('debug.reasonGBR.isUnreadWithMention');
        });
        it('returns correct reason when report has a task which is waiting for assignee to complete it', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reason;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { accountID: 12345 })];
                    case 1:
                        _b.sent();
                        reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                            reportID: '1',
                            type: CONST_1.default.REPORT.TYPE.TASK,
                            hasParentAccess: false,
                            managerID: 12345,
                            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        })) !== null && _a !== void 0 ? _a : {}).reason;
                        expect(reason).toBe('debug.reasonGBR.isWaitingForAssigneeToCompleteAction');
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report has a child report awaiting action from the user', function () {
            var _a;
            var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                reportID: '1',
                hasOutstandingChildRequest: true,
            })) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe('debug.reasonGBR.hasChildReportAwaitingAction');
        });
        it('returns undefined reason when report has no GBR', function () {
            var _a;
            var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                reportID: '1',
            })) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBeUndefined();
        });
        it('returns undefined reportAction when report is not defined', function () {
            var _a;
            var reportAction = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow(undefined)) !== null && _a !== void 0 ? _a : {}).reportAction;
            expect(reportAction).toBeUndefined();
        });
        it('returns the report action which is a join request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT_ACTIONS, reportAction;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '0': {
                                reportActionID: '0',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                created: '2024-08-08 18:70:44.171',
                            },
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                reportActionID: '1',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
                                created: '2024-08-08 19:70:44.171',
                                message: {
                                    choice: '',
                                    policyID: '0',
                                },
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1"), MOCK_REPORT_ACTIONS)];
                    case 1:
                        _b.sent();
                        reportAction = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                            reportID: '1',
                        })) !== null && _a !== void 0 ? _a : {}).reportAction;
                        expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns the report action which is awaiting action', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORTS, MOCK_REPORT_ACTIONS, reportAction;
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        MOCK_REPORTS = (_a = {},
                            // Chat report
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = {
                                reportID: '1',
                                policyID: '1',
                                hasOutstandingChildRequest: true,
                                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            },
                            // IOU report
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = {
                                reportID: '2',
                                policyID: '1',
                                managerID: 12345,
                                type: CONST_1.default.REPORT.TYPE.EXPENSE,
                                stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                                statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                            },
                            _a);
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '0': {
                                reportActionID: '0',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                created: '2024-08-08 18:70:44.171',
                                message: [
                                    {
                                        type: 'TEXT',
                                        text: 'Hello world!',
                                    },
                                ],
                            },
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                reportActionID: '1',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                                created: '2024-08-08 19:70:44.171',
                                childReportID: '2',
                                message: [
                                    {
                                        type: 'TEXT',
                                        text: 'Hello world!',
                                    },
                                ],
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign({}, MOCK_REPORTS), (_b = {}, _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_REPORT_ACTIONS, _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1")] = {
                                approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
                                type: CONST_1.default.POLICY.TYPE.CORPORATE,
                            }, _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                amount: -100,
                                currency: CONST_1.default.CURRENCY.USD,
                                reportID: '2',
                                merchant: 'test merchant',
                            }, _b[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _b)))];
                    case 1:
                        _d.sent();
                        reportAction = ((_c = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow(MOCK_REPORTS["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")])) !== null && _c !== void 0 ? _c : {}).reportAction;
                        expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns undefined report action when report has no GBR', function () {
            var _a;
            var reportAction = ((_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow({
                reportID: '1',
            })) !== null && _a !== void 0 ? _a : {}).reportAction;
            expect(reportAction).toBeUndefined();
        });
    });
    describe('getReasonAndReportActionForRBRInLHNRow', function () {
        beforeAll(function () {
            react_native_onyx_1.default.init({
                keys: ONYXKEYS_1.default,
            });
        });
        describe('reportAction', function () {
            beforeEach(function () {
                react_native_onyx_1.default.clear();
            });
            it('returns undefined when report has no RBR', function () {
                var _a;
                var reportAction = ((_a = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow({
                    reportID: '1',
                }, reports_1.chatReportR14932, undefined, {}, false, {})) !== null && _a !== void 0 ? _a : {}).reportAction;
                expect(reportAction).toBeUndefined();
            });
            it('returns undefined if it is a transaction thread, the transaction is missing smart scan fields and the report is not settled', function () { return __awaiter(void 0, void 0, void 0, function () {
                var MOCK_REPORTS, MOCK_REPORT_ACTIONS, reportAction;
                var _a, _b, _c;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            MOCK_REPORTS = (_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = {
                                    reportID: '1',
                                    parentReportID: '2',
                                    parentReportActionID: '1',
                                    statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                                },
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = {
                                    reportID: '2',
                                },
                                _a);
                            MOCK_REPORT_ACTIONS = (_b = {},
                                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "2")] = {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '1': {
                                        reportActionID: '1',
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        actorAccountID: 12345,
                                        created: '2024-08-08 18:20:44.171',
                                        message: {
                                            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                                            amount: 10,
                                            currency: CONST_1.default.CURRENCY.USD,
                                            expenseReportID: '1',
                                            text: 'Vacation expense',
                                            IOUTransactionID: '1',
                                        },
                                    },
                                },
                                _b);
                            return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, MOCK_REPORTS), MOCK_REPORT_ACTIONS), (_c = {}, _c[ONYXKEYS_1.default.SESSION] = {
                                    accountID: 12345,
                                }, _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                    amount: 0,
                                    modifiedAmount: 0,
                                }, _c)))];
                        case 1:
                            _e.sent();
                            reportAction = ((_d = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                            MOCK_REPORTS["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")], reports_1.chatReportR14932, undefined, {}, false, {})) !== null && _d !== void 0 ? _d : {}).reportAction;
                            expect(reportAction).toBe(undefined);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe("Report has missing fields, isn't settled and it's owner is the current user", function () {
                describe('Report is IOU', function () {
                    it('returns correct report action which has missing fields', function () { return __awaiter(void 0, void 0, void 0, function () {
                        var MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, reportErrors, reportAction;
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    MOCK_IOU_REPORT = {
                                        reportID: '1',
                                        type: CONST_1.default.REPORT.TYPE.IOU,
                                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                                        ownerAccountID: 12345,
                                    };
                                    MOCK_REPORT_ACTIONS = {
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '0': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                            reportActionID: '0',
                                            created: '2024-08-08 18:20:44.171',
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '1': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '1',
                                            message: {
                                                IOUTransactionID: '2',
                                            },
                                            actorAccountID: 1,
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '2': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '2',
                                            message: {
                                                IOUTransactionID: '1',
                                            },
                                            actorAccountID: 1,
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '3': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '3',
                                            message: {
                                                IOUTransactionID: '1',
                                            },
                                            actorAccountID: 12345,
                                        },
                                    };
                                    return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                                amount: 0,
                                                modifiedAmount: 0,
                                            },
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_IOU_REPORT,
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_REPORT_ACTIONS,
                                            _a[ONYXKEYS_1.default.SESSION] = {
                                                accountID: 12345,
                                            },
                                            _a))];
                                case 1:
                                    _c.sent();
                                    reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS);
                                    reportAction = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reportAction;
                                    expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                describe('Report is expense', function () {
                    it('returns correct report action which has missing fields', function () { return __awaiter(void 0, void 0, void 0, function () {
                        var MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, reportErrors, reportAction;
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    MOCK_IOU_REPORT = {
                                        reportID: '1',
                                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                                        ownerAccountID: 12345,
                                    };
                                    MOCK_REPORT_ACTIONS = {
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '0': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                            reportActionID: '0',
                                            created: '2024-08-08 18:20:44.171',
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '1': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '1',
                                            message: {
                                                IOUTransactionID: '2',
                                            },
                                            actorAccountID: 1,
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '2': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '2',
                                            message: {
                                                IOUTransactionID: '1',
                                            },
                                            actorAccountID: 1,
                                        },
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        '3': {
                                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                            reportActionID: '3',
                                            message: {
                                                IOUTransactionID: '1',
                                            },
                                            actorAccountID: 12345,
                                        },
                                    };
                                    return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                                amount: 0,
                                                modifiedAmount: 0,
                                            },
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_IOU_REPORT,
                                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_REPORT_ACTIONS,
                                            _a[ONYXKEYS_1.default.SESSION] = {
                                                accountID: 12345,
                                            },
                                            _a))];
                                case 1:
                                    _c.sent();
                                    reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS);
                                    reportAction = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reportAction;
                                    expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            });
            describe('There is a report action with smart scan errors', function () {
                it('returns correct report action which is a report preview and has an error', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var MOCK_CHAT_REPORT, MOCK_IOU_REPORT, MOCK_CHAT_REPORT_ACTIONS, MOCK_IOU_REPORT_ACTIONS, reportErrors, reportAction;
                    var _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                MOCK_CHAT_REPORT = {
                                    reportID: '1',
                                    type: CONST_1.default.REPORT.TYPE.CHAT,
                                    ownerAccountID: 12345,
                                };
                                MOCK_IOU_REPORT = {
                                    reportID: '2',
                                    type: CONST_1.default.REPORT.TYPE.IOU,
                                    statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                                    ownerAccountID: 12345,
                                };
                                MOCK_CHAT_REPORT_ACTIONS = {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '0': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                        reportActionID: '0',
                                        created: '2024-08-08 18:20:44.171',
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '1': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                                        reportActionID: '3',
                                        message: {
                                            linkedReportID: '2',
                                        },
                                        actorAccountID: 1,
                                    },
                                };
                                MOCK_IOU_REPORT_ACTIONS = {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '1': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '1',
                                        message: {
                                            IOUTransactionID: '1',
                                        },
                                        actorAccountID: 12345,
                                    },
                                };
                                return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                            amount: 0,
                                            modifiedAmount: 0,
                                        },
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_CHAT_REPORT,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = MOCK_IOU_REPORT,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_CHAT_REPORT_ACTIONS,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "2")] = MOCK_IOU_REPORT_ACTIONS,
                                        _a[ONYXKEYS_1.default.SESSION] = {
                                            accountID: 12345,
                                        },
                                        _a))];
                            case 1:
                                _c.sent();
                                reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_CHAT_REPORT, MOCK_CHAT_REPORT_ACTIONS);
                                reportAction = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(MOCK_CHAT_REPORT, reports_1.chatReportR14932, MOCK_CHAT_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reportAction;
                                expect(reportAction).toMatchObject(MOCK_CHAT_REPORT_ACTIONS['1']);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('returns correct report action which is a split bill and has an error', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var MOCK_CHAT_REPORT, MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, reportErrors, reportAction;
                    var _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                MOCK_CHAT_REPORT = {
                                    reportID: '1',
                                    type: CONST_1.default.REPORT.TYPE.CHAT,
                                    ownerAccountID: 1,
                                };
                                MOCK_IOU_REPORT = {
                                    reportID: '2',
                                    type: CONST_1.default.REPORT.TYPE.IOU,
                                    ownerAccountID: 1,
                                };
                                MOCK_REPORT_ACTIONS = {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '0': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                        reportActionID: '0',
                                        created: '2024-08-08 18:20:44.171',
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '1': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '1',
                                        message: {
                                            IOUTransactionID: '2',
                                        },
                                        actorAccountID: 1,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '2': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '2',
                                        message: {
                                            IOUTransactionID: '1',
                                        },
                                        actorAccountID: 1,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '3': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '3',
                                        message: {
                                            IOUTransactionID: '1',
                                            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT,
                                        },
                                        actorAccountID: 1,
                                    },
                                };
                                return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                            amount: 0,
                                            modifiedAmount: 0,
                                        },
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_CHAT_REPORT,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "2")] = MOCK_IOU_REPORT,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_REPORT_ACTIONS,
                                        _a[ONYXKEYS_1.default.SESSION] = {
                                            accountID: 12345,
                                        },
                                        _a))];
                            case 1:
                                _c.sent();
                                reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_CHAT_REPORT, MOCK_REPORT_ACTIONS);
                                reportAction = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(MOCK_CHAT_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reportAction;
                                expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("returns undefined if there's no report action is a report preview or a split bill", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, reportErrors, reportAction;
                    var _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                MOCK_IOU_REPORT = {
                                    reportID: '1',
                                    type: CONST_1.default.REPORT.TYPE.EXPENSE,
                                    statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                                    ownerAccountID: 12345,
                                };
                                MOCK_REPORT_ACTIONS = {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '0': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                        reportActionID: '0',
                                        created: '2024-08-08 18:20:44.171',
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '1': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '1',
                                        message: {
                                            IOUTransactionID: '2',
                                        },
                                        actorAccountID: 1,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '2': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '2',
                                        message: {
                                            IOUTransactionID: '1',
                                        },
                                        actorAccountID: 1,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    '3': {
                                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                        reportActionID: '3',
                                        message: {
                                            IOUTransactionID: '1',
                                        },
                                        actorAccountID: 12345,
                                    },
                                };
                                return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                            amount: 0,
                                            modifiedAmount: 0,
                                        },
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = MOCK_IOU_REPORT,
                                        _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = MOCK_REPORT_ACTIONS,
                                        _a[ONYXKEYS_1.default.SESSION] = {
                                            accountID: 12345,
                                        },
                                        _a))];
                            case 1:
                                _c.sent();
                                reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS);
                                reportAction = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reportAction;
                                expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            it('returns report action that contains errors', function () {
                var _a;
                var MOCK_REPORT_ACTIONS = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '0': {
                        reportActionID: '0',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        created: '2024-08-08 18:40:44.171',
                        message: [
                            {
                                type: 'TEXT',
                                text: 'Hello world!',
                            },
                        ],
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        reportActionID: '1',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        created: '2024-08-08 18:42:44.171',
                        message: [
                            {
                                type: 'TEXT',
                                text: 'Hello world!',
                            },
                        ],
                        errors: {
                            randomError: 'Random error',
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '2': {
                        reportActionID: '2',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        created: '2024-08-08 18:44:44.171',
                        message: [
                            {
                                type: 'TEXT',
                                text: 'Hello world!',
                            },
                        ],
                    },
                };
                var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
                var reportAction = ((_a = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow({
                    reportID: '1',
                }, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, {}, false, reportErrors)) !== null && _a !== void 0 ? _a : {}).reportAction;
                expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
            });
        });
        describe('reason', function () {
            it('returns correct reason when there are errors', function () {
                var _a;
                var _b;
                var mockedReport = {
                    reportID: '1',
                };
                var mockedReportActions = (_a = {},
                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "1")] = {
                        reportActionID: '1',
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                        created: '2024-09-20 13:11:11.122',
                        message: [
                            {
                                type: 'TEXT',
                                text: 'Hello world!',
                            },
                        ],
                        errors: {
                            randomError: 'Something went wrong',
                        },
                    },
                    _a);
                var reportErrors = (0, ReportUtils_1.getAllReportErrors)(mockedReport, mockedReportActions);
                var reason = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(mockedReport, reports_1.chatReportR14932, mockedReportActions, {}, false, reportErrors)) !== null && _b !== void 0 ? _b : {}).reason;
                expect(reason).toBe('debug.reasonRBR.hasErrors');
            });
            it('returns correct reason when there are violations', function () {
                var _a;
                var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow({
                    reportID: '1',
                }, reports_1.chatReportR14932, undefined, {}, true, {})) !== null && _a !== void 0 ? _a : {}).reason;
                expect(reason).toBe('debug.reasonRBR.hasViolations');
            });
            it('returns an undefined reason when the report is archived', function () {
                var _a;
                var reason = ((_a = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow({
                    reportID: '1',
                }, reports_1.chatReportR14932, undefined, {}, true, {}, true)) !== null && _a !== void 0 ? _a : {}).reason;
                expect(reason).toBe(undefined);
            });
            it('returns correct reason when there are reports on the expense chat with violations', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, reason;
                var _a;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            report = {
                                reportID: '0',
                                type: CONST_1.default.REPORT.TYPE.CHAT,
                                ownerAccountID: 1234,
                                policyID: '1',
                                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            };
                            return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                    _a[ONYXKEYS_1.default.SESSION] = {
                                        accountID: 1234,
                                    },
                                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "0")] = report,
                                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1")] = {
                                        reportID: '1',
                                        parentReportActionID: '0',
                                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                                        ownerAccountID: 1234,
                                        policyID: '1',
                                    },
                                    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "1")] = {
                                        transactionID: '1',
                                        amount: 10,
                                        modifiedAmount: 10,
                                        reportID: '0',
                                    },
                                    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, "1")] = [
                                        {
                                            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                                            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                                            showInReview: true,
                                        },
                                    ],
                                    _a))];
                        case 1:
                            _c.sent();
                            reason = ((_b = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(report, reports_1.chatReportR14932, {}, {}, false, {})) !== null && _b !== void 0 ? _b : {}).reason;
                            expect(reason).toBe('debug.reasonRBR.hasTransactionThreadViolations');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
