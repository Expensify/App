import Onyx from 'react-native-onyx';
import type {ObjectType} from '@libs/DebugUtils';
import DebugUtils from '@libs/DebugUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type ReportActionName from '../../src/types/onyx/ReportActionName';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';

const MOCK_REPORT: Report = {
    ...createRandomReport(0),
};

const MOCK_REPORT_ACTION: ReportAction = {
    ...createRandomReportAction(0),
    originalMessage: undefined,
};

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

describe('DebugUtils', () => {
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

        it('does not throw SyntaxError when value is an empty string', () => {
            expect(() => {
                DebugUtils.validateNumber('');
            }).not.toThrow();
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
            const reportAction: ReportAction = {
                ...MOCK_REPORT_ACTION,
                accountID: '2' as unknown as number,
            };
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
            const reportAction: ReportAction = {
                ...MOCK_REPORT_ACTION,
                created: 2 as unknown as string,
            };
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
            const reportAction: ReportAction = {
                ...MOCK_REPORT_ACTION,
                isLoading: 2 as unknown as boolean,
            };
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
            const reportAction: ReportAction = {
                ...MOCK_REPORT_ACTION,
                actionName: undefined as unknown as ReportActionName,
            };
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
    describe('getReasonForShowingRowInLHN', () => {
        const baseReport: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            reportName: 'My first chat',
            lastMessageText: 'Hello World!',
        };
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });
        beforeEach(() => {
            Onyx.clear();
        });
        it('returns null when report is not defined', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN(undefined);
            expect(reason).toBeNull();
        });
        it('returns correct reason when report has a valid draft comment', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}1`, 'Hello world!');
            const reason = DebugUtils.getReasonForShowingRowInLHN(baseReport);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasDraftComment');
        });
        it('returns correct reason when report has GBR', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                lastMentionedTime: '2024-08-10 18:70:44.171',
                lastReadTime: '2024-08-08 18:70:44.171',
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.hasGBR');
        });
        it('returns correct reason when report is pinned', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                isPinned: true,
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.pinnedByUser');
        });
        it('returns correct reason when report has IOU violations', async () => {
            const threadReport = {
                ...baseReport,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                parentReportID: '0',
                parentReportActionID: '0',
            };
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {
                    accountID: 1234,
                },
                [`${ONYXKEYS.COLLECTION.REPORT}0` as const]: {
                    reportID: '0',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    ownerAccountID: 1234,
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}0` as const]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '0': {
                        reportActionID: '0',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        message: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            IOUTransactionID: '0',
                            IOUReportID: '0',
                        },
                    },
                },
                [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: threadReport,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}0` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                    },
                ],
            });
            const reason = DebugUtils.getReasonForShowingRowInLHN(threadReport);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasIOUViolations');
        });
        it('returns correct reason when report has add workspace room errors', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                errorFields: {
                    addWorkspaceRoom: {
                        error: 'Something happened',
                    },
                },
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.hasAddWorkspaceRoomErrors');
        });
        it('returns correct reason when report is unread', async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);
            await Onyx.set(ONYXKEYS.SESSION, {
                accountID: 1234,
            });
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1234: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                lastVisibleActionCreated: '2024-08-10 18:70:44.171',
                lastReadTime: '2024-08-08 18:70:44.171',
                lastMessageText: 'Hello world!',
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.isUnread');
        });
        it('returns correct reason when report is archived', async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.DEFAULT);
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: 'true',
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.isArchived');
        });
        it('returns correct reason when report is self DM', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN({
                ...baseReport,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            });
            expect(reason).toBe('debug.reasonVisibleInLHN.isSelfDM');
        });
        it('returns correct reason when report is temporarily focused', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN(baseReport);
            expect(reason).toBe('debug.reasonVisibleInLHN.isFocused');
        });
        it('returns correct reason when report has one transaction thread with violations', async () => {
            const MOCK_TRANSACTION_REPORT: Report = {
                reportID: '1',
                ownerAccountID: 12345,
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const MOCK_REPORTS: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_TRANSACTION_REPORT,
                [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: {
                    reportID: '2',
                    type: CONST.REPORT.TYPE.CHAT,
                    parentReportID: '1',
                    parentReportActionID: '1',
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                },
            };
            const MOCK_REPORT_ACTIONS: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        actorAccountID: 12345,
                        created: '2024-08-08 18:20:44.171',
                        childReportID: '2',
                        message: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            amount: 10,
                            currency: CONST.CURRENCY.USD,
                            IOUReportID: '1',
                            text: 'Vacation expense',
                            IOUTransactionID: '1',
                        },
                    },
                },
            };
            await Onyx.multiSet({
                ...MOCK_REPORTS,
                ...MOCK_REPORT_ACTIONS,
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                    transactionID: '1',
                    amount: 10,
                    modifiedAmount: 10,
                    reportID: '1',
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    },
                ],
            });
            const reason = DebugUtils.getReasonForShowingRowInLHN(MOCK_TRANSACTION_REPORT, true);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
        });
        it('returns correct reason when report has violations', async () => {
            const MOCK_EXPENSE_REPORT: Report = {
                reportID: '1',
                chatReportID: '2',
                parentReportID: '2',
                parentReportActionID: '1',
                ownerAccountID: 12345,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const MOCK_REPORTS: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_EXPENSE_REPORT,
                [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: {
                    reportID: '2',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                },
            };
            const MOCK_REPORT_ACTIONS: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2` as const]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        actorAccountID: 12345,
                        created: '2024-08-08 18:20:44.171',
                        message: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            amount: 10,
                            currency: CONST.CURRENCY.USD,
                            IOUReportID: '1',
                            text: 'Vacation expense',
                            IOUTransactionID: '1',
                        },
                    },
                },
            };
            await Onyx.multiSet({
                ...MOCK_REPORTS,
                ...MOCK_REPORT_ACTIONS,
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                    transactionID: '1',
                    amount: 10,
                    modifiedAmount: 10,
                    reportID: '1',
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1` as const]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    },
                ],
            });
            const reason = DebugUtils.getReasonForShowingRowInLHN(MOCK_EXPENSE_REPORT, true);
            expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
        });
        it('returns correct reason when report has errors', () => {
            const reason = DebugUtils.getReasonForShowingRowInLHN(
                {
                    ...baseReport,
                    errors: {
                        error: 'Something went wrong',
                    },
                },
                true,
            );
            expect(reason).toBe('debug.reasonVisibleInLHN.hasRBR');
        });
    });
    describe('getReasonAndReportActionForGBRInLHNRow', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });
        beforeEach(() => {
            Onyx.clear();
        });
        it('returns undefined reason when report is not defined', () => {
            const {reason} = DebugUtils.getReasonAndReportActionForGBRInLHNRow(undefined) ?? {};
            expect(reason).toBeUndefined();
        });
        it('returns correct reason when report has a join request', async () => {
            const MOCK_REPORT_ACTIONS = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '0': {
                    reportActionID: '0',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
                    created: '2024-08-08 19:70:44.171',
                    message: {
                        choice: '' as JoinWorkspaceResolution,
                        policyID: '0',
                    },
                } as ReportAction<'ACTIONABLEJOINREQUEST'>,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, MOCK_REPORT_ACTIONS);
            const {reason} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                }) ?? {};
            expect(reason).toBe('debug.reasonGBR.hasJoinRequest');
        });
        it('returns correct reason when report is unread with mention', () => {
            const {reason} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                    lastMentionedTime: '2024-08-10 18:70:44.171',
                    lastReadTime: '2024-08-08 18:70:44.171',
                }) ?? {};
            expect(reason).toBe('debug.reasonGBR.isUnreadWithMention');
        });
        it('returns correct reason when report has a task which is waiting for assignee to complete it', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 12345});
            const {reason} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                    type: CONST.REPORT.TYPE.TASK,
                    hasParentAccess: false,
                    managerID: 12345,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                }) ?? {};
            expect(reason).toBe('debug.reasonGBR.isWaitingForAssigneeToCompleteAction');
        });
        it('returns correct reason when report has a child report awaiting action from the user', () => {
            const {reason} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                    hasOutstandingChildRequest: true,
                }) ?? {};
            expect(reason).toBe('debug.reasonGBR.hasChildReportAwaitingAction');
        });
        it('returns undefined reason when report has no GBR', () => {
            const {reason} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                }) ?? {};
            expect(reason).toBeUndefined();
        });
        it('returns undefined reportAction when report is not defined', () => {
            const {reportAction} = DebugUtils.getReasonAndReportActionForGBRInLHNRow(undefined) ?? {};
            expect(reportAction).toBeUndefined();
        });
        it('returns the report action which is a join request', async () => {
            const MOCK_REPORT_ACTIONS = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '0': {
                    reportActionID: '0',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: '2024-08-08 18:70:44.171',
                } as ReportAction<'CREATED'>,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
                    created: '2024-08-08 19:70:44.171',
                    message: {
                        choice: '' as JoinWorkspaceResolution,
                        policyID: '0',
                    },
                } as ReportAction<'ACTIONABLEJOINREQUEST'>,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, MOCK_REPORT_ACTIONS);
            const {reportAction} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                }) ?? {};
            expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
        });
        it('returns the report action which is awaiting action', async () => {
            const MOCK_REPORTS: ReportCollectionDataSet = {
                // Chat report
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {
                    reportID: '1',
                    policyID: '1',
                    hasOutstandingChildRequest: true,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                },
                // IOU report
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {
                    reportID: '2',
                    policyID: '1',
                    managerID: 12345,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                },
            };
            const MOCK_REPORT_ACTIONS: ReportActions = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '0': {
                    reportActionID: '0',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: '2024-08-08 18:70:44.171',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    created: '2024-08-08 19:70:44.171',
                    childReportID: '2',
                },
            };
            await Onyx.multiSet({
                ...MOCK_REPORTS,
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}2` as const]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    private_isArchived: false,
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_REPORT_ACTIONS,
                [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    type: CONST.POLICY.TYPE.CORPORATE,
                },
                [ONYXKEYS.SESSION]: {
                    accountID: 12345,
                },
            });
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const {reportAction} = DebugUtils.getReasonAndReportActionForGBRInLHNRow(MOCK_REPORTS[`${ONYXKEYS.COLLECTION.REPORT}1`] as Report) ?? {};
            expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
        });
        it('returns undefined report action when report has no GBR', () => {
            const {reportAction} =
                DebugUtils.getReasonAndReportActionForGBRInLHNRow({
                    reportID: '1',
                }) ?? {};
            expect(reportAction).toBeUndefined();
        });
    });
    describe('getReasonAndReportActionForRBRInLHNRow', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });
        describe('reportAction', () => {
            beforeEach(() => {
                Onyx.clear();
            });
            it('returns undefined when report has no RBR', () => {
                const {reportAction} =
                    DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                        {
                            reportID: '1',
                        },
                        undefined,
                        false,
                    ) ?? {};
                expect(reportAction).toBeUndefined();
            });
            // TODO: remove '.failing' once the implementation is fixed
            it.failing('returns parentReportAction if it is a transaction thread, the transaction is missing smart scan fields and the report is not settled', async () => {
                const MOCK_REPORTS: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: {
                        reportID: '1',
                        parentReportID: '2',
                        parentReportActionID: '1',
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    },
                    [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: {
                        reportID: '2',
                    },
                };
                const MOCK_REPORT_ACTIONS: ReportActionsCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2` as const]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            reportActionID: '1',
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            actorAccountID: 12345,
                            created: '2024-08-08 18:20:44.171',
                            message: {
                                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                                amount: 10,
                                currency: CONST.CURRENCY.USD,
                                expenseReportID: '1',
                                text: 'Vacation expense',
                                IOUTransactionID: '1',
                            },
                        },
                    },
                };
                await Onyx.multiSet({
                    ...MOCK_REPORTS,
                    ...MOCK_REPORT_ACTIONS,
                    [ONYXKEYS.SESSION]: {
                        accountID: 12345,
                    },
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                        amount: 0,
                        modifiedAmount: 0,
                    },
                });
                const {reportAction} =
                    DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                        MOCK_REPORTS[`${ONYXKEYS.COLLECTION.REPORT}1`] as Report,
                        undefined,
                        false,
                    ) ?? {};
                expect(reportAction).toBe(1);
            });
            describe("Report has missing fields, isn't settled and it's owner is the current user", () => {
                describe('Report is IOU', () => {
                    it('returns correct report action which has missing fields', async () => {
                        const MOCK_IOU_REPORT: Report = {
                            reportID: '1',
                            type: CONST.REPORT.TYPE.IOU,
                            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                            ownerAccountID: 12345,
                        };
                        const MOCK_REPORT_ACTIONS: ReportActions = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '0': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                reportActionID: '0',
                                created: '2024-08-08 18:20:44.171',
                            } as ReportAction<'CREATED'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '1',
                                message: {
                                    IOUTransactionID: '2',
                                },
                                actorAccountID: 1,
                            } as ReportAction<'IOU'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '2': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '2',
                                message: {
                                    IOUTransactionID: '1',
                                },
                                actorAccountID: 1,
                            } as ReportAction<'IOU'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '3': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '3',
                                message: {
                                    IOUTransactionID: '1',
                                },
                                actorAccountID: 12345,
                            } as ReportAction<'IOU'>,
                        };
                        await Onyx.multiSet({
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                                amount: 0,
                                modifiedAmount: 0,
                            },
                            [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_IOU_REPORT,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_REPORT_ACTIONS,
                            [ONYXKEYS.SESSION]: {
                                accountID: 12345,
                            },
                        });
                        const {reportAction} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, false) ?? {};
                        expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                    });
                });
                describe('Report is expense', () => {
                    it('returns correct report action which has missing fields', async () => {
                        const MOCK_IOU_REPORT: Report = {
                            reportID: '1',
                            type: CONST.REPORT.TYPE.EXPENSE,
                            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                            ownerAccountID: 12345,
                        };
                        const MOCK_REPORT_ACTIONS: ReportActions = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '0': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                reportActionID: '0',
                                created: '2024-08-08 18:20:44.171',
                            } as ReportAction<'CREATED'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '1',
                                message: {
                                    IOUTransactionID: '2',
                                },
                                actorAccountID: 1,
                            } as ReportAction<'IOU'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '2': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '2',
                                message: {
                                    IOUTransactionID: '1',
                                },
                                actorAccountID: 1,
                            } as ReportAction<'IOU'>,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '3': {
                                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                                reportActionID: '3',
                                message: {
                                    IOUTransactionID: '1',
                                },
                                actorAccountID: 12345,
                            } as ReportAction<'IOU'>,
                        };
                        await Onyx.multiSet({
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                                amount: 0,
                                modifiedAmount: 0,
                            },
                            [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_IOU_REPORT,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_REPORT_ACTIONS,
                            [ONYXKEYS.SESSION]: {
                                accountID: 12345,
                            },
                        });
                        const {reportAction} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, false) ?? {};
                        expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                    });
                });
            });
            describe('There is a report action with smart scan errors', () => {
                it('returns correct report action which is a report preview and has an error', async () => {
                    const MOCK_CHAT_REPORT: Report = {
                        reportID: '1',
                        type: CONST.REPORT.TYPE.CHAT,
                        ownerAccountID: 12345,
                    };
                    const MOCK_IOU_REPORT: Report = {
                        reportID: '2',
                        type: CONST.REPORT.TYPE.IOU,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        ownerAccountID: 12345,
                    };
                    const MOCK_CHAT_REPORT_ACTIONS: ReportActions = {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '0': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                            reportActionID: '0',
                            created: '2024-08-08 18:20:44.171',
                        } as ReportAction<'CREATED'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                            reportActionID: '3',
                            message: {
                                linkedReportID: '2',
                            },
                            actorAccountID: 1,
                        } as ReportAction<'REPORTPREVIEW'>,
                    };
                    const MOCK_IOU_REPORT_ACTIONS = {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '1',
                            message: {
                                IOUTransactionID: '1',
                            },
                            actorAccountID: 12345,
                        } as ReportAction<'IOU'>,
                    };
                    await Onyx.multiSet({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                            amount: 0,
                            modifiedAmount: 0,
                        },
                        [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_CHAT_REPORT,
                        [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: MOCK_IOU_REPORT,
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_CHAT_REPORT_ACTIONS,
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2` as const]: MOCK_IOU_REPORT_ACTIONS,
                        [ONYXKEYS.SESSION]: {
                            accountID: 12345,
                        },
                    });
                    const {reportAction} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(MOCK_CHAT_REPORT, MOCK_CHAT_REPORT_ACTIONS, false) ?? {};
                    expect(reportAction).toMatchObject(MOCK_CHAT_REPORT_ACTIONS['1']);
                });
                it('returns correct report action which is a split bill and has an error', async () => {
                    const MOCK_CHAT_REPORT: Report = {
                        reportID: '1',
                        type: CONST.REPORT.TYPE.CHAT,
                        ownerAccountID: 1,
                    };
                    const MOCK_IOU_REPORT: Report = {
                        reportID: '2',
                        type: CONST.REPORT.TYPE.IOU,
                        ownerAccountID: 1,
                    };
                    const MOCK_REPORT_ACTIONS: ReportActions = {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '0': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                            reportActionID: '0',
                            created: '2024-08-08 18:20:44.171',
                        } as ReportAction<'CREATED'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '1',
                            message: {
                                IOUTransactionID: '2',
                            },
                            actorAccountID: 1,
                        } as ReportAction<'IOU'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '2',
                            message: {
                                IOUTransactionID: '1',
                            },
                            actorAccountID: 1,
                        } as ReportAction<'IOU'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '3': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '3',
                            message: {
                                IOUTransactionID: '1',
                                type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                            },
                            actorAccountID: 1,
                        } as ReportAction<'IOU'>,
                    };
                    await Onyx.multiSet({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                            amount: 0,
                            modifiedAmount: 0,
                        },
                        [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_CHAT_REPORT,
                        [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: MOCK_IOU_REPORT,
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_REPORT_ACTIONS,
                        [ONYXKEYS.SESSION]: {
                            accountID: 12345,
                        },
                    });
                    const {reportAction} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(MOCK_CHAT_REPORT, MOCK_REPORT_ACTIONS, false) ?? {};
                    expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                });
                it("returns undefined if there's no report action is a report preview or a split bill", async () => {
                    const MOCK_IOU_REPORT: Report = {
                        reportID: '1',
                        type: CONST.REPORT.TYPE.EXPENSE,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        ownerAccountID: 12345,
                    };
                    const MOCK_REPORT_ACTIONS: ReportActions = {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '0': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                            reportActionID: '0',
                            created: '2024-08-08 18:20:44.171',
                        } as ReportAction<'CREATED'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '1',
                            message: {
                                IOUTransactionID: '2',
                            },
                            actorAccountID: 1,
                        } as ReportAction<'IOU'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '2',
                            message: {
                                IOUTransactionID: '1',
                            },
                            actorAccountID: 1,
                        } as ReportAction<'IOU'>,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '3': {
                            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                            reportActionID: '3',
                            message: {
                                IOUTransactionID: '1',
                            },
                            actorAccountID: 12345,
                        } as ReportAction<'IOU'>,
                    };
                    await Onyx.multiSet({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}1` as const]: {
                            amount: 0,
                            modifiedAmount: 0,
                        },
                        [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: MOCK_IOU_REPORT,
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1` as const]: MOCK_REPORT_ACTIONS,
                        [ONYXKEYS.SESSION]: {
                            accountID: 12345,
                        },
                    });
                    const {reportAction} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(MOCK_IOU_REPORT, MOCK_REPORT_ACTIONS, false) ?? {};
                    expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['3']);
                });
            });
            it('returns report action that contains errors', () => {
                const MOCK_REPORT_ACTIONS: ReportActions = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '0': {
                        reportActionID: '0',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        created: '2024-08-08 18:40:44.171',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '1': {
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        created: '2024-08-08 18:42:44.171',
                        errors: {
                            randomError: 'Random error',
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '2': {
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        created: '2024-08-08 18:44:44.171',
                    },
                };
                const {reportAction} =
                    DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                        {
                            reportID: '1',
                        },
                        MOCK_REPORT_ACTIONS,
                        false,
                    ) ?? {};
                expect(reportAction).toMatchObject(MOCK_REPORT_ACTIONS['1']);
            });
        });
        describe('reason', () => {
            it('returns correct reason when there are errors', () => {
                const {reason} =
                    DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                        {
                            reportID: '1',
                        },
                        {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                                reportActionID: '1',
                                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                created: '2024-09-20 13:11:11.122',
                                errors: {
                                    randomError: 'Something went wrong',
                                },
                            },
                        },
                        false,
                    ) ?? {};
                expect(reason).toBe('debug.reasonRBR.hasErrors');
            });
            it('returns correct reason when there are violations', () => {
                const {reason} =
                    DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                        {
                            reportID: '1',
                        },
                        undefined,
                        true,
                    ) ?? {};
                expect(reason).toBe('debug.reasonRBR.hasViolations');
            });
            it('returns correct reason when there are transaction thread violations', async () => {
                const threadReport: Report = {
                    reportID: '1',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                    reportName: 'My first chat',
                    lastMessageText: 'Hello World!',
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    parentReportID: '0',
                    parentReportActionID: '0',
                };
                const reportActions: ReportActions = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '0': {
                        reportActionID: '0',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        message: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            IOUTransactionID: '0',
                            IOUReportID: '0',
                            amount: 10,
                            currency: CONST.CURRENCY.USD,
                            text: '',
                        },
                        created: '2024-07-13 06:02:11.111',
                    },
                };
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        accountID: 1234,
                    },
                    [`${ONYXKEYS.COLLECTION.REPORT}0` as const]: {
                        reportID: '0',
                        type: CONST.REPORT.TYPE.EXPENSE,
                        ownerAccountID: 1234,
                    },
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}0` as const]: reportActions,
                    [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: threadReport,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}0` as const]: [
                        {
                            type: CONST.VIOLATION_TYPES.VIOLATION,
                            name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                        },
                    ],
                });
                const {reason} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(threadReport, reportActions, false) ?? {};
                expect(reason).toBe('debug.reasonRBR.hasTransactionThreadViolations');
            });
        });
    });
});
