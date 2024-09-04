import type {ObjectType} from '@libs/DebugUtils';
import DebugUtils from '@libs/DebugUtils';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

const MOCK_REPORT: Report = {
    reportName: 'Chat Report',
    isOptimisticReport: false,
    type: 'chat',
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    lastActorAccountID: 2,
    lastMessageTranslationKey: '',
    lastMessageHtml: '',
    lastReadTime: '2024-08-08 18:20:44.175',
    lastVisibleActionCreated: '2024-08-08 18:20:44.171',
    notificationPreference: 'hidden',
    oldPolicyName: '',
    ownerAccountID: 0,
    participants: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '14365522': {
            hidden: true,
            role: 'member',
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '15083345': {
            hidden: true,
            role: 'admin',
        },
    },
    policyID: '_FAKE_',
    reportID: '2305929876534021',
    stateNum: 0,
    statusNum: 0,
    description: '',
    pendingFields: {},
    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
    currency: 'USD',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isWaitingOnBankAccount: false,
    lastActionType: 'CREATED',
    lastMessageText: '',
    lastReadSequenceNumber: 0,
    lastVisibleActionLastModified: '2024-08-08 18:20:44.171',
    managerID: 0,
    nonReimbursableTotal: 0,
    permissions: ['read', 'write'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_isArchived: '',
    total: 0,
    unheldTotal: 0,
    writeCapability: 'all',
    visibility: CONST.REPORT.VISIBILITY.PUBLIC,
    tripData: {
        startDate: '2024-08-08 18:20:44.171',
        endDate: '2024-08-08 20:20:44.171',
        tripID: '1',
    },
    pendingChatMembers: [
        {
            accountID: '1',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        },
    ],
    privateNotes: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        1: {
            note: 'Hello world!',
        },
    },
} satisfies Report;

const MOCK_REPORT_ACTION: ReportAction = {
    reportActionID: '3035455786832804210',
    actionName: 'CREATED',
    actorAccountID: 15083345,
    message: [
        {
            type: 'TEXT',
            style: 'strong',
            text: '__fake__',
        },
        {
            type: 'TEXT',
            style: 'normal',
            text: ' created this report',
        },
    ],
    person: [
        {
            type: 'TEXT',
            style: 'strong',
            text: '__fake__',
        },
    ],
    automatic: false,
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
    created: '2024-08-08 18:20:44.171',
    shouldShow: true,
    sequenceNumber: 0,
    lastModified: '2024-08-08 18:20:44.171',
    errors: {},
    whisperedToAccountIDs: [],
    isLoading: false,
    childStateNum: CONST.REPORT.STATE_NUM.OPEN,
    childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
    childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
} satisfies ReportAction;

const MOCK_DRAFT_REPORT_ACTION = DebugUtils.onyxDataToString(MOCK_REPORT_ACTION);

const MOCK_CONST_ENUM = {
    foo: 'foo',
    bar: 'bar',
};

const TEST_OBJECT = {
    a: 1,
    b: 'a',
    c: [],
    d: {},
    e: true,
    f: false,
};

const TEST_OBJECT_TYPE = {
    a: 'number',
    b: 'string',
    c: 'array',
    d: 'object',
    e: 'boolean',
    f: 'boolean',
} satisfies ObjectType;

describe('Debug Utils', () => {
    describe('onyxDataToString', () => {
        it('returns "undefined" when data is undefined', () => {
            expect(DebugUtils.onyxDataToString(undefined)).toBe('undefined');
        });
        it('returns JSON string when data is an object', () => {
            expect(DebugUtils.onyxDataToString(MOCK_REPORT_ACTION)).toBe(MOCK_DRAFT_REPORT_ACTION);
        });
        it('returns string when data is string', () => {
            expect(DebugUtils.onyxDataToString(2)).toBe('2');
        });
    });
    describe('stringToOnyxData', () => {
        it('returns number when type is number', () => {
            expect(DebugUtils.stringToOnyxData('2', 'number')).toBe(2);
        });
        it('returns bigint when type is bigint', () => {
            expect(DebugUtils.stringToOnyxData('2', 'bigint')).toBe(BigInt(2));
        });
        it('returns object when type is object', () => {
            expect(DebugUtils.stringToOnyxData('{\n      "a": 2\n}', 'object')).toEqual({a: 2});
        });
        it('returns true when type is boolean and data is "true"', () => {
            expect(DebugUtils.stringToOnyxData('true', 'boolean')).toBe(true);
        });
        it('returns false when type is boolean and data is "false"', () => {
            expect(DebugUtils.stringToOnyxData('false', 'boolean')).toBe(false);
        });
        it('returns null when type is undefined', () => {
            expect(DebugUtils.stringToOnyxData('2', 'undefined')).toBe(null);
        });
        it('returns string when type is string', () => {
            expect(DebugUtils.stringToOnyxData('2', 'string')).toBe('2');
        });
        it('returns string when type is symbol', () => {
            expect(DebugUtils.stringToOnyxData('2', 'symbol')).toBe('2');
        });
        it('returns string when type is function', () => {
            expect(DebugUtils.stringToOnyxData('2', 'symbol')).toBe('2');
        });
        it('returns string when type is not specified', () => {
            expect(DebugUtils.stringToOnyxData('2')).toBe('2');
        });
    });
    describe('compareStringWithOnyxData', () => {
        it('returns true when data is undefined and text is "undefined"', () => {
            expect(DebugUtils.compareStringWithOnyxData('undefined', undefined)).toBe(true);
        });
        it('returns false when data is undefined and text is not "undefined"', () => {
            expect(DebugUtils.compareStringWithOnyxData('A', undefined)).toBe(false);
        });
        it('returns true when data is object and text is data in JSON format', () => {
            expect(DebugUtils.compareStringWithOnyxData(MOCK_DRAFT_REPORT_ACTION, MOCK_REPORT_ACTION)).toBe(true);
        });
        it('returns false when data is object and text is not data in JSON format', () => {
            expect(DebugUtils.compareStringWithOnyxData('{}', MOCK_REPORT_ACTION)).toBe(false);
        });
        it('returns true when data is string and text equals to data', () => {
            expect(DebugUtils.compareStringWithOnyxData('A', 'A')).toBe(true);
        });
        it('returns false when data is string and text is not equal to data', () => {
            expect(DebugUtils.compareStringWithOnyxData('2', 'A')).toBe(false);
        });
    });
    describe('getNumberOfLinesFromString', () => {
        it('returns 1 when string is empty', () => {
            expect(DebugUtils.getNumberOfLinesFromString('')).toBe(1);
        });
        it('returns 1 when no "\\n" are present in the string', () => {
            expect(DebugUtils.getNumberOfLinesFromString('Something something something')).toBe(1);
        });
        it('returns k when there are k - 1 "\\n" present in the string', () => {
            expect(DebugUtils.getNumberOfLinesFromString('Line1\n Line2\nLine3')).toBe(3);
        });
    });
    describe('onyxDataToDraftData', () => {
        it('returns an empty object if data is an empty object', () => {
            expect(DebugUtils.onyxDataToDraftData({})).toEqual({});
        });
        it('returns a converted object where all values are string representations of the original values from data object', () => {
            expect(
                DebugUtils.onyxDataToDraftData({
                    ...TEST_OBJECT,
                    g: [1],
                    h: ['a'],
                    i: [true],
                    j: [false],
                    k: [{}],
                    l: [TEST_OBJECT],
                    m: TEST_OBJECT,
                    n: undefined,
                }),
            ).toEqual({
                a: '1',
                b: 'a',
                c: '[]',
                d: '{}',
                e: 'true',
                f: 'false',
                g: DebugUtils.onyxDataToString([1]),
                h: DebugUtils.onyxDataToString(['a']),
                i: DebugUtils.onyxDataToString([true]),
                j: DebugUtils.onyxDataToString([false]),
                k: DebugUtils.onyxDataToString([{}]),
                l: DebugUtils.onyxDataToString([TEST_OBJECT]),
                m: DebugUtils.onyxDataToString(TEST_OBJECT),
                n: 'undefined',
            });
        });
    });
    describe('validateNumber', () => {
        it('does not throw SyntaxError when value is "undefined"', () => {
            expect(() => {
                DebugUtils.validateNumber('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a number', () => {
            expect(() => {
                DebugUtils.validateNumber('1');
            }).not.toThrow();
        });
        it('throws SyntaxError when value contains white spaces', () => {
            expect(() => {
                DebugUtils.validateNumber('    ');
            }).toThrow();
        });
        it('throws SyntaxError when value is an empty string', () => {
            expect(() => {
                DebugUtils.validateNumber('');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid number', () => {
            expect(() => {
                DebugUtils.validateNumber('A');
            }).toThrow();
        });
    });
    describe('validateBoolean', () => {
        it('does not throw SyntaxError when value is "undefined"', () => {
            expect(() => {
                DebugUtils.validateBoolean('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of true', () => {
            expect(() => {
                DebugUtils.validateBoolean('true');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of false', () => {
            expect(() => {
                DebugUtils.validateBoolean('false');
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a boolean', () => {
            expect(() => {
                DebugUtils.validateBoolean('1');
            }).toThrow();
        });
    });
    describe('validateDate', () => {
        it('does not throw SyntaxError when value is "undefined"', () => {
            expect(() => {
                DebugUtils.validateDate('undefined');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a date', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-08 18:20:44.171');
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - number', () => {
            expect(() => {
                DebugUtils.validateDate('1');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid year', () => {
            expect(() => {
                DebugUtils.validateDate('20-08-08 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid month', () => {
            expect(() => {
                DebugUtils.validateDate('2024-14-08 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid day', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-40 18:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid hour', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-08 32:20:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid minutes', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-08 18:70:44.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid seconds', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-08 18:20:70.171');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a date - invalid milliseconds', () => {
            expect(() => {
                DebugUtils.validateDate('2024-08-08 18:20:44.1710');
            }).toThrow();
        });
    });
    describe('validateConstantEnum', () => {
        it('does not throw SyntaxError when value is "undefined"', () => {
            expect(() => {
                DebugUtils.validateConstantEnum('undefined', MOCK_CONST_ENUM);
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a constant enum', () => {
            expect(() => {
                DebugUtils.validateConstantEnum('foo', MOCK_CONST_ENUM);
            }).not.toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a constant enum', () => {
            expect(() => {
                DebugUtils.validateConstantEnum('1', MOCK_CONST_ENUM);
            }).toThrow();
        });
    });
    describe('validateArray', () => {
        it('does not throw SyntaxError when value is "undefined"', () => {
            expect(() => {
                DebugUtils.validateArray('undefined', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a string representation of an empty array', () => {
            expect(() => {
                DebugUtils.validateArray('[]', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a number array', () => {
            expect(() => {
                DebugUtils.validateArray('[1]', 'number');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of a string array', () => {
            expect(() => {
                DebugUtils.validateArray('["a"]', 'string');
            }).not.toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of an object array', () => {
            expect(() => {
                DebugUtils.validateArray(DebugUtils.onyxDataToString([TEST_OBJECT]), TEST_OBJECT_TYPE);
            }).not.toThrow();
        });
        it('throws SyntaxError when value is just a string', () => {
            expect(() => {
                DebugUtils.validateArray('a', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is a string representation of an object', () => {
            expect(() => {
                DebugUtils.validateArray('{}', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a number array', () => {
            expect(() => {
                DebugUtils.validateArray('["a"]', 'number');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a string array', () => {
            expect(() => {
                DebugUtils.validateArray('[1]', 'string');
            }).toThrow();
        });
        it('throws SyntaxError when value is not a valid string representation of a constant enum array', () => {
            expect(() => {
                DebugUtils.validateArray('["a"]', MOCK_CONST_ENUM);
            }).toThrow();
        });
        it('throws SyntaxError when value is a valid string representation of an object array but it has an invalid property type', () => {
            expect(() => {
                DebugUtils.validateArray(
                    DebugUtils.onyxDataToString([
                        {
                            c: 'a',
                        },
                    ]),
                    {
                        c: ['number', 'undefined'],
                    },
                );
            }).toThrow();
        });
        it('does not throw SyntaxError when value is a valid string representation of an object array and has valid property types', () => {
            expect(() => {
                DebugUtils.validateArray(
                    DebugUtils.onyxDataToString([
                        {
                            c: 2,
                        },
                    ]),
                    {
                        c: ['number', 'undefined'],
                    },
                );
            }).not.toThrow();
        });
        it("throws SyntaxError when value is a valid string representation of an object array but there's a property type which is not an array as expected", () => {
            expect(() => {
                DebugUtils.validateArray(
                    DebugUtils.onyxDataToString([
                        {
                            c: 2,
                        },
                    ]),
                    {
                        c: 'array',
                    },
                );
            }).toThrow();
        });
    });
    describe('validateObject', () => {
        describe('value is undefined', () => {
            it('does not throw SyntaxError', () => {
                expect(() => {
                    DebugUtils.validateObject('undefined', {});
                }).not.toThrow();
            });
        });
        describe('value is a JSON representation of an object', () => {
            describe('object is valid', () => {
                it('does not throw SyntaxError', () => {
                    expect(() => {
                        DebugUtils.validateObject(DebugUtils.onyxDataToString(TEST_OBJECT), TEST_OBJECT_TYPE);
                    }).not.toThrow();
                });
            });
            describe('object has an invalid property', () => {
                it('throws SyntaxError', () => {
                    expect(() => {
                        DebugUtils.validateObject(
                            DebugUtils.onyxDataToString({
                                a: 'a',
                                b: 'a',
                                c: [],
                                d: {},
                                e: true,
                                f: false,
                            }),
                            TEST_OBJECT_TYPE,
                        );
                    }).toThrow();
                });
            });
            describe('object is a collection', () => {
                describe('collection index type is invalid', () => {
                    it('throws SyntaxError', () => {
                        expect(() => {
                            DebugUtils.validateObject(
                                DebugUtils.onyxDataToString({
                                    a: {
                                        foo: 'bar',
                                    },
                                }),
                                {
                                    foo: 'string',
                                },
                                'number',
                            );
                        }).toThrow();
                    });
                });
                describe('collection index type is valid', () => {
                    describe('collection value type is not valid', () => {
                        it('throws SyntaxError', () => {
                            expect(() => {
                                DebugUtils.validateObject(
                                    DebugUtils.onyxDataToString({
                                        a: [1, 2, 3],
                                    }),
                                    {
                                        foo: 'string',
                                    },
                                    'string',
                                );
                            }).toThrow();
                        });
                    });
                });
            });
        });
        describe('value is a JSON representation of an array', () => {
            it('throws SyntaxError', () => {
                expect(() => {
                    DebugUtils.validateObject(DebugUtils.onyxDataToString([TEST_OBJECT]), TEST_OBJECT_TYPE);
                }).toThrow();
            });
        });
        describe('JSON contains an invalid property', () => {
            it('throws SyntaxError', () => {
                expect(() => {
                    DebugUtils.validateObject(
                        DebugUtils.onyxDataToString({
                            a: 'a',
                            b: 'a',
                            c: [],
                            d: {},
                            e: true,
                            f: false,
                        }),
                        TEST_OBJECT_TYPE,
                    );
                }).toThrow();
            });
        });
    });
    describe('validateString', () => {
        describe('value is undefined', () => {
            it('does not throw SyntaxError"', () => {
                expect(() => {
                    DebugUtils.validateString('undefined');
                }).not.toThrow();
            });
        });
    });
    describe('validateReportDraftProperty', () => {
        describe.each(Object.keys(MOCK_REPORT) as Array<keyof Report>)('%s', (key) => {
            describe('is undefined', () => {
                it(`${DebugUtils.REPORT_REQUIRED_PROPERTIES.includes(key) ? 'throws SyntaxError' : 'does not throw SyntaxError'}`, () => {
                    if (DebugUtils.REPORT_REQUIRED_PROPERTIES.includes(key)) {
                        expect(() => {
                            DebugUtils.validateReportDraftProperty(key, 'undefined');
                        }).toThrow();
                    } else {
                        expect(() => {
                            DebugUtils.validateReportDraftProperty(key, 'undefined');
                        }).not.toThrow();
                    }
                });
            });
            describe('is invalid', () => {
                it('throws SyntaxError', () => {
                    const value = MOCK_REPORT[key];
                    let invalidValue: unknown;
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
                    expect(() => {
                        DebugUtils.validateReportDraftProperty(key, DebugUtils.onyxDataToString(invalidValue));
                    }).toThrow();
                });
            });
            describe('is valid', () => {
                it('does not throw SyntaxError', () => {
                    expect(() => {
                        DebugUtils.validateReportDraftProperty(key, DebugUtils.onyxDataToString(MOCK_REPORT[key]));
                    }).not.toThrow();
                });
            });
        });
    });
    describe('validateReportActionDraftProperty', () => {
        describe.each(Object.keys(MOCK_REPORT_ACTION) as Array<keyof ReportAction>)('%s', (key) => {
            it(`${DebugUtils.REPORT_ACTION_REQUIRED_PROPERTIES.includes(key) ? "throws SyntaxError when 'undefined'" : 'does not throw SyntaxError when "undefined"'}`, () => {
                if (DebugUtils.REPORT_ACTION_REQUIRED_PROPERTIES.includes(key)) {
                    expect(() => {
                        DebugUtils.validateReportActionDraftProperty(key, 'undefined');
                    }).toThrow();
                } else {
                    expect(() => {
                        DebugUtils.validateReportActionDraftProperty(key, 'undefined');
                    }).not.toThrow();
                }
            });
            it('throws SyntaxError when invalid', () => {
                const value = MOCK_REPORT_ACTION[key];
                let invalidValue: unknown;
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
                expect(() => {
                    DebugUtils.validateReportActionDraftProperty(key, DebugUtils.onyxDataToString(invalidValue));
                }).toThrow();
            });
            it('does not throw SyntaxError when valid', () => {
                expect(() => {
                    DebugUtils.validateReportActionDraftProperty(key, DebugUtils.onyxDataToString(MOCK_REPORT_ACTION[key]));
                }).not.toThrow();
            });
        });
    });
    describe('validateReportActionJSON', () => {
        it('does not throw SyntaxError when valid', () => {
            expect(() => {
                DebugUtils.validateReportActionJSON(MOCK_DRAFT_REPORT_ACTION);
            }).not.toThrow();
        });
        it('throws SyntaxError when property is not a valid number', () => {
            const reportAction = {
                ...MOCK_REPORT_ACTION,
                accountID: '2',
            } as unknown as ReportAction;
            const draftReportAction = DebugUtils.onyxDataToString(reportAction);
            expect(() => {
                DebugUtils.validateReportActionJSON(draftReportAction);
            }).toThrow(
                new SyntaxError('debug.invalidProperty', {
                    cause: {
                        propertyName: 'accountID',
                        expectedType: 'number | undefined',
                    },
                }),
            );
        });
        it('throws SyntaxError when property is not a valid date', () => {
            const reportAction = {
                ...MOCK_REPORT_ACTION,
                created: 2,
            } as unknown as ReportAction;
            const draftReportAction = DebugUtils.onyxDataToString(reportAction);
            expect(() => {
                DebugUtils.validateReportActionJSON(draftReportAction);
            }).toThrow(
                new SyntaxError('debug.invalidProperty', {
                    cause: {
                        propertyName: 'created',
                        expectedType: CONST.DATE.FNS_DB_FORMAT_STRING,
                    },
                }),
            );
        });
        it('throws SyntaxError when property is not a valid boolean', () => {
            const reportAction = {
                ...MOCK_REPORT_ACTION,
                isLoading: 2,
            } as unknown as ReportAction;
            const draftReportAction = DebugUtils.onyxDataToString(reportAction);
            expect(() => {
                DebugUtils.validateReportActionJSON(draftReportAction);
            }).toThrow(
                new SyntaxError('debug.invalidProperty', {
                    cause: {
                        propertyName: 'isLoading',
                        expectedType: 'true | false | undefined',
                    },
                }),
            );
        });
        it('throws SyntaxError when property is missing', () => {
            const reportAction = {
                ...MOCK_REPORT_ACTION,
                actionName: undefined,
            } as unknown as ReportAction;
            const draftReportAction = DebugUtils.onyxDataToString(reportAction);
            expect(() => {
                DebugUtils.validateReportActionJSON(draftReportAction);
            }).toThrow(
                new SyntaxError('debug.missingProperty', {
                    cause: {
                        propertyName: 'actionName',
                    },
                }),
            );
        });
    });
});
