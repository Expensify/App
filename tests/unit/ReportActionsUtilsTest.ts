import type {KeyValueMapping} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import getReportURLForCurrentContext from '@libs/Navigation/helpers/getReportURLForCurrentContext';
import {isExpenseReport} from '@libs/ReportUtils';
import IntlStore from '@src/languages/IntlStore';
import ROUTES from '@src/ROUTES';
import {actionR14932 as mockIOUAction, originalMessageR14932 as mockOriginalMessage} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as mockChatReport, iouReportR14932 as mockIOUReport} from '../../__mocks__/reportData/reports';
import CONST from '../../src/CONST';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';
import {
    getCardIssuedMessage,
    getCompanyAddressUpdateMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getReportActionActorAccountID,
    getSendMoneyFlowAction,
    getUpdateACHAccountMessage,
    isIOUActionMatchingTransactionList,
} from '../../src/libs/ReportActionsUtils';
import {buildOptimisticCreatedReportForUnapprovedAction} from '../../src/libs/ReportUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {Card, OriginalMessageIOU, Report, ReportAction, ReportActions} from '../../src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

describe('ReportActionsUtils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        IntlStore.load(CONST.LOCALES.DEFAULT);
        // Initialize the network key for OfflineWithFeedback
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        return waitForBatchedUpdates();
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('getSortedReportActions', () => {
        const cases = [
            [
                [
                    // This is the highest created timestamp, so should appear last
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },

                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
            [
                [
                    // Given three reportActions with the same timestamp
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    // The CREATED action should appear first, then we should sort by reportActionID
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
            [
                [
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    // this item has no created field, so it should appear right after CONST.REPORT.ACTIONS.TYPE.CREATED
                    {
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.889',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.989',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.889',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.989',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
        ];

        test.each(cases)('sorts by created, then actionName, then reportActionID', (input, expectedOutput) => {
            const result = ReportActionsUtils.getSortedReportActions(input as ReportAction[]);
            expect(result).toStrictEqual(expectedOutput);
        });

        test.each(cases)('in descending order', (input, expectedOutput) => {
            const result = ReportActionsUtils.getSortedReportActions(input as ReportAction[], true);
            expect(result).toStrictEqual(expectedOutput.reverse());
        });
    });

    describe('isIOUActionMatchingTransactionList', () => {
        const nonIOUAction = {
            created: '2022-11-13 22:27:01.825',
            reportActionID: '8401445780099176',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {
                html: 'Hello world',
                whisperedTo: [],
            },
            message: [
                {
                    html: 'Hello world',
                    type: 'Action type',
                    text: 'Action text',
                },
            ],
        };

        it('returns false for non-money request actions when defaultToFalseForNonIOU is true', () => {
            expect(isIOUActionMatchingTransactionList(nonIOUAction, undefined, true)).toBeFalsy();
        });

        it('returns true for non-money request actions when defaultToFalseForNonIOU is false', () => {
            expect(isIOUActionMatchingTransactionList(nonIOUAction, undefined, false)).toBeTruthy();
        });

        it('returns true if no reportTransactionIDs are provided', () => {
            expect(isIOUActionMatchingTransactionList(mockIOUAction)).toBeTruthy();
        });

        it('returns true if action is of excluded type', () => {
            const action = {
                ...mockIOUAction,
                originalMessage: {
                    ...mockOriginalMessage,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            };
            expect(isIOUActionMatchingTransactionList(action, ['124', '125', '126'])).toBeTruthy();
        });

        it('returns true if IOUTransactionID matches any provided reportTransactionIDs', () => {
            expect(isIOUActionMatchingTransactionList(mockIOUAction, ['123', '124', mockOriginalMessage.IOUTransactionID])).toBeTruthy();
        });

        it('returns false if IOUTransactionID does not match any provided reportTransactionIDs', () => {
            expect(isIOUActionMatchingTransactionList(mockIOUAction, ['123', '124'])).toBeFalsy();
        });
    });

    describe('getOneTransactionThreadReportAction', () => {
        const IOUReportID = `${ONYXKEYS.COLLECTION.REPORT}REPORT_IOU` as const;
        const IOUTransactionID = `${ONYXKEYS.COLLECTION.TRANSACTION}TRANSACTION_IOU` as const;
        const IOUExpenseTransactionID = `${ONYXKEYS.COLLECTION.TRANSACTION}TRANSACTION_EXPENSE` as const;
        const mockChatReportID = `${ONYXKEYS.COLLECTION.REPORT}${mockChatReport.reportID}` as const;
        const mockedReports: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {
            [IOUReportID]: {...mockIOUReport, reportID: IOUReportID},
            [mockChatReportID]: mockChatReport,
        };
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const originalMessage = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(mockIOUAction) as OriginalMessageIOU;

        const linkedActionWithChildReportID = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID},
            childReportID: 'existingChildReportID',
        };

        const deletedLinkedActionWithChildReportID: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
            ...mockIOUAction,
            message: [{deleted: '2025-11-27 09:06:16.568', type: 'COMMENT', text: ''}],
            originalMessage: {...originalMessage, IOUTransactionID: '123'},
            childReportID: 'existingChildReportID',
        };

        const linkedActionWithoutChildReportID = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID},
            childReportID: undefined,
        };

        const unlinkedAction = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID: IOUExpenseTransactionID},
        };

        const payAction = {
            ...mockIOUAction,
            originalMessage: {
                ...originalMessage,
                IOUTransactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            },
        };

        it('should return action when single IOU action exists', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedActionWithChildReportID], false, [
                IOUTransactionID,
            ]);
            expect(result).toEqual(linkedActionWithChildReportID);
        });

        it('should return undefined when no linked actions exist', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(mockedReports[IOUReportID], mockedReports[mockChatReportID], [unlinkedAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });

        it('should return undefined when multiple IOU actions exist', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(
                mockedReports[IOUReportID],
                mockedReports[mockChatReportID],
                [linkedActionWithChildReportID, linkedActionWithoutChildReportID],
                false,
                [IOUTransactionID],
            );
            expect(result).toBeUndefined();
        });

        it('should skip PAY actions and return valid IOU action', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(
                mockedReports[IOUReportID],
                mockedReports[mockChatReportID],
                [payAction, linkedActionWithoutChildReportID],
                false,
                [IOUTransactionID],
            );
            expect(result).toEqual(linkedActionWithoutChildReportID);
        });

        it('should return undefined when only PAY actions exist', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(mockedReports[IOUReportID], mockedReports[mockChatReportID], [payAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });

        it('should return action when single IOU action and deleted IOU action exist', () => {
            const result = ReportActionsUtils.getOneTransactionThreadReportAction(
                mockedReports[IOUReportID],
                mockedReports[mockChatReportID],
                [linkedActionWithChildReportID, deletedLinkedActionWithChildReportID],
                false,
            );
            expect(result).toEqual(linkedActionWithChildReportID);
        });
    });

    describe('getOneTransactionThreadReportID', () => {
        const IOUReportID = `${ONYXKEYS.COLLECTION.REPORT}REPORT_IOU` as const;
        const IOUTransactionID = `${ONYXKEYS.COLLECTION.TRANSACTION}TRANSACTION_IOU` as const;
        const IOUExpenseTransactionID = `${ONYXKEYS.COLLECTION.TRANSACTION}TRANSACTION_EXPENSE` as const;
        const mockChatReportID = `${ONYXKEYS.COLLECTION.REPORT}${mockChatReport.reportID}` as const;
        const mockedReports: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {
            [IOUReportID]: {...mockIOUReport, reportID: IOUReportID},
            [mockChatReportID]: mockChatReport,
        };

        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const originalMessage = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(mockIOUAction) as OriginalMessageIOU;
        const linkedCreateAction = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID},
        };

        const linkedCreateActionWithoutChildReportID = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID},
            childReportID: undefined,
        };

        const unlinkedCreateAction = {
            ...mockIOUAction,
            originalMessage: {...originalMessage, IOUTransactionID: IOUExpenseTransactionID},
        };

        const linkedDeleteAction = {
            ...mockIOUAction,
            originalMessage: {
                ...originalMessage,
                IOUTransactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.DELETE,
            },
        };

        const linkedPayAction = {
            ...mockIOUAction,
            originalMessage: {
                ...originalMessage,
                IOUTransactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            },
        };

        const linkedPayActionWithIOUDetails = {
            ...mockIOUAction,
            originalMessage: {
                ...originalMessage,
                IOUTransactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                IOUDetails: {
                    amount: originalMessage?.amount,
                    currency: originalMessage?.currency,
                },
            },
        };

        it('should return the childReportID for a valid single IOU action', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toEqual(linkedCreateAction.childReportID);
        });

        it('should return CONST.FAKE_REPORT_ID when action exists but childReportID is undefined', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedCreateActionWithoutChildReportID], false, [IOUTransactionID]);
            expect(result).toEqual(CONST.FAKE_REPORT_ID);
        });

        it('should return undefined for action with a transaction that is not linked to it', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [unlinkedCreateAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });

        it('should return undefined if multiple IOU actions are present', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedCreateAction, linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toBeUndefined();
        });

        it('should skip actions where original message type is PAY', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedPayAction, linkedCreateAction], false, [IOUTransactionID]);
            expect(result).toEqual(linkedCreateAction.childReportID);
        });

        it('should return the childReportID if original message type is PAY with IOUDetails', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [linkedPayActionWithIOUDetails], false, [IOUTransactionID]);
            expect(result).toEqual(linkedPayActionWithIOUDetails.childReportID);
        });

        it('should return undefined if no valid IOU actions are present', () => {
            const result = getOneTransactionThreadReportID(mockedReports[IOUReportID], mockedReports[mockChatReportID], [unlinkedCreateAction, linkedDeleteAction, linkedPayAction], false, [
                IOUTransactionID,
            ]);
            expect(result).toBeUndefined();
        });
    });

    describe('getSortedReportActionsForDisplay', () => {
        it('should filter out non-whitelisted actions', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '8049485084562457',
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD,
                    originalMessage: {},
                    message: [{html: 'updated the Approval Mode from "Submit and Approve" to "Submit and Close"', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-08 22:27:06.825',
                    reportActionID: '1661970171066216',
                    actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                    originalMessage: {
                        paymentType: 'ACH',
                    },
                    message: [{html: 'Waiting for the bank account', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-06 22:27:08.825',
                    reportActionID: '1661970171066220',
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_EDITED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: 'I have changed the task', type: 'Action type', text: 'Action text'}],
                },
            ];

            // Expected output should have the `CREATED` action at last
            // eslint-disable-next-line rulesdir/prefer-at
            const expectedOutput: ReportAction[] = [...input.slice(0, 1), ...input.slice(2), input[1]];

            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            expect(result).toStrictEqual(expectedOutput);
        });

        it('should not show moved transaction system message when expense is moved from personal space', () => {
            const movedTransactionAction: ReportAction = {
                created: '2022-11-13 22:27:01.825',
                reportActionID: '8401445780099177',
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                originalMessage: {
                    fromReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    toReportID: '123',
                },
            };

            const addCommentAction: ReportAction = {
                created: '2022-11-12 22:27:01.825',
                reportActionID: '6401435781022176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: 'Hello world',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };

            const input: ReportAction[] = [movedTransactionAction, addCommentAction];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);

            expect(result).toStrictEqual([addCommentAction]);
        });

        it('should filter out closed actions', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '1661970171066218',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: 'default', // change to const
                        reason: 'default', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];

            // Expected output should have the `CREATED` action at last and `CLOSED` action removed
            // eslint-disable-next-line rulesdir/prefer-at
            const expectedOutput: ReportAction[] = [...input.slice(0, 1), ...input.slice(2, -1), input[1]];

            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            expect(result).toStrictEqual(expectedOutput);
        });

        it('should filter out deleted, non-pending comments', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '8401445780099175',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: '', type: 'Action type', text: 'Action text'}],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '8401445780099174',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: '', type: 'Action type', text: 'Action text'}],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input, true);
            input.pop();
            expect(result).toStrictEqual(input);
        });

        it('should filter actionable whisper actions e.g. "join", "create room" when room is archived', () => {
            // Given several different action types, including actionable whispers for creating, inviting and joining rooms, as well as non-actionable whispers
            // - ADD_COMMENT
            // - ACTIONABLE_REPORT_MENTION_WHISPER
            // - ACTIONABLE_MENTION_WHISPER
            const input: ReportAction[] = [
                {
                    created: '2024-11-19 08:04:13.728',
                    reportActionID: '1607371725956675966',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: '<mention-user accountID="18414674"/>',
                        whisperedTo: [],
                        lastModified: '2024-11-19 08:04:13.728',
                        mentionedAccountIDs: [18301266],
                    },
                    message: [
                        {
                            html: '<mention-user accountID="18414674"/>',
                            text: '@as',
                            type: 'COMMENT',
                            whisperedTo: [],
                        },
                    ],
                },
                {
                    created: '2024-11-19 08:00:14.352',
                    reportActionID: '4655978522337302598',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    originalMessage: {
                        html: '#join',
                        whisperedTo: [],
                        lastModified: '2024-11-19 08:00:14.352',
                    },
                    message: [
                        {
                            html: '#join',
                            text: '#join',
                            type: 'COMMENT',
                            whisperedTo: [],
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '8049485084562457',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
                    originalMessage: {
                        lastModified: '2024-11-19 08:00:14.353',
                        mentionedAccountIDs: [],
                        whisperedTo: [18301266],
                    },
                    message: {
                        html: "Heads up, <mention-report>#join</mention-report> doesn't exist yet. Do you want to create it?",
                        text: "Heads up, #join doesn't exist yet. Do you want to create it?",
                        type: 'COMMENT',
                        whisperedTo: [18301266],
                    },
                },

                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER,
                    originalMessage: {
                        inviteeAccountIDs: [18414674],
                        lastModified: '2024-11-19 08:04:25.813',
                        whisperedTo: [18301266],
                    },
                    message: [
                        {
                            html: "Heads up, <mention-user accountID=18414674></mention-user> isn't a member of this room.",
                            text: "Heads up,  isn't a member of this room.",
                            type: 'COMMENT',
                        },
                    ],
                },
            ];

            // When the report actions are sorted for display with the second parameter (canUserPerformWriteAction) set to false (to simulate a report that has been archived)
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input, false);
            // The output should correctly filter out the actionable whisper types for "join," "invite," and "create room" because the report is archived.
            // Taking these actions not only doesn't make sense from a UX standpoint,  but also leads to server errors since such actions are not possible.
            const expectedOutput: ReportAction[] = input.filter(
                (action) =>
                    action.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER &&
                    action.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST &&
                    action.actionName !== CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER,
            );

            expect(result).toStrictEqual(expectedOutput);
        });
    });

    describe('hasRequestFromCurrentAccount', () => {
        const currentUserAccountID = 1242;
        const deletedIOUReportID = '2';
        const activeIOUReportID = '3';

        const deletedIOUReportAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            reportActionID: '22',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            message: [
                {
                    deleted: '2025-07-15 09:06:16.568',
                    html: '',
                    isDeletedParentAction: false,
                    isEdited: true,
                    text: '',
                    type: 'COMMENT',
                },
            ],
        };

        const activeIOUReportAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            reportActionID: '33',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            message: [
                {
                    deleted: '',
                    html: '$87.00 expense',
                    isDeletedParentAction: false,
                    isEdited: true,
                    text: '',
                    type: 'COMMENT',
                },
            ],
        };

        beforeEach(() => {
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${deletedIOUReportID}`]: {[deletedIOUReportAction.reportActionID]: deletedIOUReportAction},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${activeIOUReportID}`]: {[activeIOUReportAction.reportActionID]: activeIOUReportAction},
            } as unknown as KeyValueMapping);
            return waitForBatchedUpdates();
        });

        it('should return false for a deleted IOU report action', () => {
            const result = ReportActionsUtils.hasRequestFromCurrentAccount(deletedIOUReportID, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return true for an active IOU report action', () => {
            const result = ReportActionsUtils.hasRequestFromCurrentAccount(activeIOUReportID, currentUserAccountID);
            expect(result).toBe(true);
        });
    });

    describe('getLastVisibleAction', () => {
        it('should return the last visible action for a report', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport([8401445480599174, 9401445480599174], 3, true),
                reportID: '1',
            };
            const action: ReportAction = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3),
                created: '2023-08-01 16:00:00',
                reportActionID: 'action1',
                actionName: 'ADDCOMMENT',
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            const action2: ReportAction = {
                ...LHNTestUtils.getFakeReportAction('email2@test.com', 3),
                created: '2023-08-01 18:00:00',
                reportActionID: 'action2',
                actionName: 'ADDCOMMENT',
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            return (
                waitForBatchedUpdates()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action, [action2.reportActionID]: action2},
                        } as unknown as KeyValueMapping),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                                    callback: () => {
                                        Onyx.disconnect(connection);
                                        const res = ReportActionsUtils.getLastVisibleAction(report.reportID);
                                        expect(res).toEqual(action2);
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });

    describe('getReportActionMessageFragments', () => {
        it('should return the correct fragment for the REIMBURSED action', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
                reportActionID: '1',
                created: '1',
                message: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: 'Concierge',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' reimbursed this report',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' on behalf of you',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: ' from the bank account ending in 1111',
                    },
                    {
                        type: 'TEXT',
                        style: 'normal',
                        text: '. Money is on its way to your bank account ending in 0000. Reimbursement estimated to complete on Dec 16.',
                    },
                ],
            };
            const expectedMessage = ReportActionsUtils.getReportActionMessageText(action);
            const expectedFragments = ReportActionsUtils.getReportActionMessageFragments(translateLocal, action);
            expect(expectedFragments).toEqual([{text: expectedMessage, html: `<muted-text>${expectedMessage}</muted-text>`, type: 'COMMENT'}]);
        });

        it('should return the correct fragment for the DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action', () => {
            // Given a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                reportActionID: '1',
                created: '1',
                message: [],
                originalMessage: {
                    to: 'example@gmail.com',
                },
            };

            // When getting the message fragments of the action
            const expectedMessage = ReportActionsUtils.getDynamicExternalWorkflowRoutedMessage(action, translateLocal);
            const expectedFragments = ReportActionsUtils.getReportActionMessageFragments(translateLocal, action);

            // Then it should return the correct message fragments
            expect(expectedFragments).toEqual([{text: expectedMessage, html: `<muted-text>${expectedMessage}</muted-text>`, type: 'COMMENT'}]);
        });
    });

    describe('getSendMoneyFlowAction', () => {
        const mockChatReportID = `${ONYXKEYS.COLLECTION.REPORT}REPORT` as const;
        const mockDMChatReportID = `${ONYXKEYS.COLLECTION.REPORT}REPORT_DM` as const;
        const childReportID = `${ONYXKEYS.COLLECTION.REPORT}childReport123` as const;

        const mockedReports: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {
            [mockChatReportID]: {...mockChatReport, reportID: mockChatReportID},
            [mockDMChatReportID]: {
                ...mockChatReport,
                reportID: mockDMChatReportID,
                chatType: undefined,
                parentReportID: undefined,
                parentReportActionID: undefined,
            },
        };

        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const originalMessage = getOriginalMessage(mockIOUAction) as OriginalMessageIOU;
        const createAction = {
            ...mockIOUAction,
            childReportID,
            originalMessage: {...originalMessage, type: CONST.IOU.TYPE.CREATE},
        };

        const nonIOUAction = {
            ...mockIOUAction,
            childReportID,
            type: CONST.REPORT.ACTIONS.TYPE.CREATED,
        };

        const payAction = {
            ...mockIOUAction,
            childReportID,
            originalMessage: {...originalMessage, type: CONST.IOU.TYPE.PAY},
        };

        it('should return undefined for a single non-IOU action', () => {
            expect(getSendMoneyFlowAction([nonIOUAction], mockedReports[mockDMChatReportID])?.childReportID).toBeUndefined();
        });

        it('should return undefined for multiple IOU actions regardless of type', () => {
            expect(getSendMoneyFlowAction([payAction, payAction], mockedReports[mockDMChatReportID])?.childReportID).toBeUndefined();
        });

        it('should return undefined for a single IOU action that is not `Pay`', () => {
            expect(getSendMoneyFlowAction([createAction], mockedReports[mockDMChatReportID])?.childReportID).toBeUndefined();
        });

        it('should return the appropriate childReportID for a valid single `Pay` IOU action in DM chat', () => {
            expect(getSendMoneyFlowAction([payAction], mockedReports[mockDMChatReportID])?.childReportID).toEqual(childReportID);
        });

        it('should return undefined for a valid single `Pay` IOU action in a chat that is not DM', () => {
            expect(getSendMoneyFlowAction([payAction], mockedReports[mockChatReportID])?.childReportID).toBeUndefined();
        });

        it('should return undefined for a valid `Pay` IOU action in DM chat that has also a create IOU action', () => {
            expect(getSendMoneyFlowAction([payAction, createAction], mockedReports[mockDMChatReportID])?.childReportID).toBeUndefined();
        });
    });

    describe('shouldShowAddMissingDetails', () => {
        it('should return true if personal detail is not completed', () => {
            const mockPersonalDetail = {
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                },
            };
            const res = ReportActionsUtils.shouldShowAddMissingDetails(CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS, mockPersonalDetail);
            expect(res).toEqual(true);
        });
        it('should return false if personal detail is completed', () => {
            const mockPersonalDetail = {
                addresses: [
                    {
                        street: '123 Main St',
                        city: 'New York',
                        state: 'NY',
                        postalCode: '10001',
                    },
                ],
                legalFirstName: 'John',
                legalLastName: 'David',
                phoneNumber: '+162992973',
                dob: '9-9-2000',
            };
            const res = ReportActionsUtils.shouldShowAddMissingDetails(CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS, mockPersonalDetail);
            expect(res).toEqual(false);
        });
    });

    describe('isDeletedAction', () => {
        it('should return true if reportAction is undefined', () => {
            expect(ReportActionsUtils.isDeletedAction(undefined)).toBe(true);
        });

        it('should return false for POLICY_CHANGE_LOG.INVITE_TO_ROOM action', () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
                originalMessage: {
                    html: '',
                    whisperedTo: [],
                },
                reportActionID: '1',
                created: '1',
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(false);
        });

        it('should return true if message is an empty array', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });

        it('should return true if message html is empty', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: {
                    html: '',
                    type: 'Action type',
                    text: 'Action text',
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });

        it('should return true if message is not an array and deleted is not empty', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: {
                    html: 'Hello world',
                    deleted: 'deleted',
                    type: 'Action type',
                    text: 'Action text',
                },
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });

        it('should return true if message an array and first element deleted is not empty', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: 'Hello world',
                        deleted: 'deleted',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });

        it('should return true if message is an object with html field with empty string as value is empty', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: '',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(true);
        });

        it('should return false otherwise', () => {
            const reportAction = {
                created: '2022-11-09 22:27:01.825',
                reportActionID: '8401445780099176',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
                message: [
                    {
                        html: 'Hello world',
                        type: 'Action type',
                        text: 'Action text',
                    },
                ],
            };
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(false);
        });

        it('should return false for CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS action with empty message array', () => {
            const reportAction = buildOptimisticCreatedReportForUnapprovedAction('123456', '789012');
            expect(ReportActionsUtils.isDeletedAction(reportAction)).toBe(false);
        });
    });

    describe('getRenamedAction', () => {
        it('should return the correct translated message for a renamed action', () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                    lastModified: '2022-11-09 22:27:01.825',
                    oldName: 'Old name',
                    newName: 'New name',
                },
                reportActionID: '1',
                created: '1',
            };
            const report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.CHAT};
            expect(ReportActionsUtils.getRenamedAction(translateLocal, reportAction, isExpenseReport(report), 'John')).toBe('John renamed this room to "New name" (previously "Old name")');
        });

        it('should return the correct translated message for a renamed action in expense report', () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                    lastModified: '2022-11-09 22:27:01.825',
                    oldName: 'Old name',
                    newName: 'New name',
                },
                reportActionID: '1',
                created: '1',
            };
            const report = {...createRandomReport(2, undefined), type: CONST.REPORT.TYPE.EXPENSE};

            expect(ReportActionsUtils.getRenamedAction(translateLocal, reportAction, isExpenseReport(report), 'John')).toBe('John renamed to "New name" (previously "Old name")');
        });
    });
    describe('getCardIssuedMessage', () => {
        const mockVirtualCardIssuedAction: ReportAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
            reportActionID: 'virtual-card-action-123',
            actorAccountID: 123,
            created: '2024-01-01',
            message: [],
            originalMessage: {
                assigneeAccountID: 456,
                cardID: 789,
            },
        } as ReportAction;

        const activeExpensifyCard: Card = {
            cardID: 789,
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            bank: '',
            availableSpend: 0,
            domainName: '',
            lastFourPAN: '',
            lastUpdated: '2024-01-01',
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        } as Card;

        const testPolicyID = 'test-policy-123';

        describe('render virtual card issued messages', () => {
            it('should render a plain text message without card link when no card data is available', () => {
                const messageResult = getCardIssuedMessage({
                    reportAction: mockVirtualCardIssuedAction,
                    shouldRenderHTML: true,
                    policyID: testPolicyID,
                    expensifyCard: undefined,
                    translate: translateLocal,
                });

                expect(messageResult).toBe('issued <mention-user accountID="456"/> a virtual Expensify Card! The card can be used right away.');
            });

            it('should render a message with clickable card link when the card is active', () => {
                const messageResult = getCardIssuedMessage({
                    reportAction: mockVirtualCardIssuedAction,
                    shouldRenderHTML: true,
                    policyID: testPolicyID,
                    expensifyCard: activeExpensifyCard,
                    translate: translateLocal,
                });

                expect(messageResult).toBe(
                    `issued <mention-user accountID="456"/> a virtual Expensify Card! The <a href='https://dev.new.expensify.com:8082/settings/card/789'>card</a> can be used right away.`,
                );
            });
        });
    });

    describe('shouldReportActionBeVisible', () => {
        it('should return false for moved transaction if the report destination is unavailable', () => {
            // Given a moved transaction action but the report destination is not available
            const reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                reportActionID: '1',
                created: '2025-09-29',
                originalMessage: {
                    fromReportID: '2',
                },
            };

            // Then the action should not be visible
            const actual = ReportActionsUtils.shouldReportActionBeVisible(reportAction, reportAction.reportActionID, true);
            expect(actual).toBe(false);
        });

        it('should return false for actionable card fraud alert if the resolution is recognized', () => {
            const reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
                reportActionID: '1',
                originalMessage: {
                    resolution: CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED,
                    cardID: 123,
                    maskedCardNumber: '1234',
                    triggerAmount: 0,
                    triggerMerchant: 'Merchant',
                },
                created: '2025-09-29',
            };

            const actual = ReportActionsUtils.shouldReportActionBeVisible(reportAction, reportAction.reportActionID, false);
            expect(actual).toBe(false);
        });

        it('should return true for moved transaction if the report destination is available', async () => {
            // Given a moved transaction action but the report destination is available
            const report: Report = createRandomReport(2, undefined);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            const reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                reportActionID: '1',
                created: '2025-09-29',
                originalMessage: {
                    toReportID: report.reportID,
                    fromReportID: '1',
                },
            };

            // Then the action should be visible
            const actual = ReportActionsUtils.shouldReportActionBeVisible(reportAction, reportAction.reportActionID, true);
            expect(actual).toBe(true);
        });
    });

    describe('getPolicyChangeLogUpdateEmployee', () => {
        it('should remove SMS domain when the email is a phone number', () => {
            const email = '+919383833920@expensify.sms';
            const newValue = 'test';
            const previousValue = '';
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE,
                message: [],
                previousMessage: [],
                originalMessage: {
                    email,
                    field: CONST.CUSTOM_FIELD_KEYS.customField1,
                    newValue,
                    oldValue: previousValue,
                },
            };

            const actual = ReportActionsUtils.getPolicyChangeLogUpdateEmployee(translateLocal, action);
            const expected = translateLocal('report.actions.type.updatedCustomField1', {email: formatPhoneNumber(email), newValue, previousValue});
            expect(actual).toBe(expected);
        });

        it('should concatenate multiple field changes when fields array is present', () => {
            const email = 'employee@example.com';
            const newRole = CONST.POLICY.ROLE.ADMIN;
            const previousRole = CONST.POLICY.ROLE.USER;
            const customFieldNewValue = '12';
            const customFieldOldValue = '10';
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE,
                message: [],
                previousMessage: [],
                originalMessage: {
                    email,
                    fields: [
                        {
                            field: CONST.CUSTOM_FIELD_KEYS.customField1,
                            newValue: customFieldNewValue,
                            oldValue: customFieldOldValue,
                        },
                        {
                            field: 'role',
                            newValue: newRole,
                            oldValue: previousRole,
                        },
                    ],
                },
            };

            const formattedEmail = formatPhoneNumber(email);
            const expectedCustomFieldMessage = translateLocal('report.actions.type.updatedCustomField1', {
                email: formattedEmail,
                newValue: customFieldNewValue,
                previousValue: customFieldOldValue,
            });
            const expectedRoleMessage = translateLocal('report.actions.type.updateRole', {
                email: formattedEmail,
                newRole: translateLocal('workspace.common.roleName', {role: newRole}).toLowerCase(),
                currentRole: translateLocal('workspace.common.roleName', {role: previousRole}).toLowerCase(),
            });

            const actual = ReportActionsUtils.getPolicyChangeLogUpdateEmployee(translateLocal, action);
            expect(actual).toBe(`${expectedCustomFieldMessage}, ${expectedRoleMessage}`);
        });
    });

    describe('getPolicyChangeLogDeleteMemberMessage', () => {
        it('should remove SMS domain when the email is a phone number', () => {
            const email = '+919383833920@expensify.sms';
            const role = CONST.POLICY.ROLE.USER;
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE,
                message: [],
                previousMessage: [],
                originalMessage: {
                    email,
                    role,
                },
            };

            const actual = ReportActionsUtils.getPolicyChangeLogDeleteMemberMessage(translateLocal, action);
            const expected = translateLocal('report.actions.type.removeMember', formatPhoneNumber(email), translateLocal('workspace.common.roleName', {role}).toLowerCase());
            expect(actual).toBe(expected);
        });
    });
    describe('isDeletedAction', () => {
        it('should return false if the action is a hold or unhold action', () => {
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOLD | typeof CONST.REPORT.ACTIONS.TYPE.UNHOLD> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
                created: '2025-09-29',
                reportActionID: '1',
                originalMessage: undefined,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'Hold',
                    },
                ],
                previousMessage: [],
            };
            expect(ReportActionsUtils.isDeletedAction(action)).toBe(false);
        });
    });

    describe('getHarvestCreatedExpenseReportMessage', () => {
        let environmentURL: string;
        beforeAll(async () => {
            environmentURL = await getEnvironmentURL();
        });

        it('should return the correct message with a valid report ID and report name', () => {
            const reportID = '12345';
            const reportName = 'Test Expense Report';
            const expectedMessage = translateLocal('reportAction.harvestCreatedExpenseReport', `${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(reportID)}`, reportName);

            const result = ReportActionsUtils.getHarvestCreatedExpenseReportMessage(reportID, reportName, translateLocal);

            expect(result).toBe(expectedMessage);
        });
    });

    describe('getCreatedReportForUnapprovedTransactionsMessage', () => {
        it('should return the correct message with a valid report ID and report name', () => {
            const reportID = '67890';
            const reportName = 'Original Report';
            const reportUrl = getReportURLForCurrentContext(reportID);
            const expectedMessage = translateLocal('reportAction.createdReportForUnapprovedTransactions', {
                reportUrl,
                reportName,
            });

            const result = getCreatedReportForUnapprovedTransactionsMessage(reportID, reportName, translateLocal);

            expect(result).toBe(expectedMessage);
        });
    });

    describe('isDynamicExternalWorkflowSubmitFailedAction', () => {
        it('should return true for DEW_SUBMIT_FAILED action type', () => {
            // Given a report action with DEW_SUBMIT_FAILED action type
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21',
                reportActionID: '1',
                originalMessage: {
                    message: 'This report contains an Airfare expense that is missing the Flight Destination tag.',
                    automaticAction: true,
                },
                message: [],
                previousMessage: [],
            };

            // When checking if the action is a DEW submit failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitFailedAction(action);

            // Then it should return true because the action type is DEW_SUBMIT_FAILED
            expect(result).toBe(true);
        });

        it('should return false for non-DEW_SUBMIT_FAILED action type', () => {
            // Given a report action with SUBMITTED action type (not DEW_SUBMIT_FAILED)
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21',
                reportActionID: '1',
                originalMessage: {
                    amount: 10000,
                    currency: 'USD',
                },
                message: [],
                previousMessage: [],
            };

            // When checking if the action is a DEW submit failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitFailedAction(action);

            // Then it should return false because the action type is not DEW_SUBMIT_FAILED
            expect(result).toBe(false);
        });

        it('should return false for null action', () => {
            // Given a null action

            // When checking if the action is a DEW submit failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitFailedAction(null);

            // Then it should return false because the action is null
            expect(result).toBe(false);
        });
    });

    describe('getMostRecentActiveDEWSubmitFailedAction', () => {
        it('should return the DEW action when DEW_SUBMIT_FAILED exists and no SUBMITTED action exists', () => {
            // Given report actions containing only a DEW_SUBMIT_FAILED action
            const actionId1 = '1';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return the DEW action because there's no subsequent SUBMITTED action
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe(actionId1);
        });

        it('should return the DEW action when DEW_SUBMIT_FAILED is more recent than SUBMITTED', () => {
            // Given report actions where DEW_SUBMIT_FAILED occurred after SUBMITTED
            const actionId1 = '1';
            const actionId2 = '2';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        amount: 10000,
                        currency: 'USD',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId2,
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return the DEW action because it's more recent than the SUBMITTED action
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe(actionId2);
        });

        it('should return undefined when SUBMITTED is more recent than DEW_SUBMIT_FAILED', () => {
            // Given report actions where SUBMITTED occurred after DEW_SUBMIT_FAILED
            const actionId1 = '1';
            const actionId2 = '2';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId2,
                    originalMessage: {
                        amount: 10000,
                        currency: 'USD',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return undefined because a successful SUBMITTED action supersedes the DEW failure
            expect(result).toBeUndefined();
        });

        it('should return undefined when no DEW_SUBMIT_FAILED action exists', () => {
            // Given report actions containing only a SUBMITTED action (no DEW failures)
            const actionId1 = '1';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        amount: 10000,
                        currency: 'USD',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return undefined because there are no DEW failures
            expect(result).toBeUndefined();
        });

        it('should return undefined for empty report actions', () => {
            // Given an empty report actions object

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction({});

            // Then it should return undefined because there are no actions
            expect(result).toBeUndefined();
        });

        it('should handle array input and return the DEW action when it is most recent', () => {
            // Given an array of report actions where DEW_SUBMIT_FAILED is more recent
            const reportActionsArray: ReportAction[] = [
                {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: '1',
                    originalMessage: {
                        amount: 10000,
                        currency: 'USD',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
                {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: '2',
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
            ];

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActionsArray);

            // Then it should return the DEW action because it's the most recent
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe('2');
        });

        it('should return the most recent DEW action when multiple DEW failures and submissions exist', () => {
            // Given report actions with multiple DEW failures and submissions, where the latest DEW failure is most recent
            const actionId1 = '1';
            const actionId2 = '2';
            const actionId3 = '3';
            const actionId4 = '4';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 08:00:00',
                    reportActionID: actionId1,
                    originalMessage: {amount: 10000, currency: 'USD'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId2,
                    originalMessage: {message: 'First DEW failure'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
                [actionId3]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId3,
                    originalMessage: {amount: 10000, currency: 'USD'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
                [actionId4]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 11:00:00',
                    reportActionID: actionId4,
                    originalMessage: {message: 'Second DEW failure'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return the most recent DEW action (11:00) because it's after the most recent SUBMITTED (10:00)
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe(actionId4);
        });

        it('should return undefined when most recent SUBMITTED is after all DEW failures', () => {
            // Given report actions where SUBMITTED is more recent than all DEW failures
            const actionId1 = '1';
            const actionId2 = '2';
            const actionId3 = '3';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 08:00:00',
                    reportActionID: actionId1,
                    originalMessage: {message: 'First DEW failure'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId2,
                    originalMessage: {message: 'Second DEW failure'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED>,
                [actionId3]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId3,
                    originalMessage: {amount: 10000, currency: 'USD'},
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
            };

            // When getting the most recent active DEW submit failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWSubmitFailedAction(reportActions);

            // Then it should return undefined because the successful submission supersedes all prior DEW failures
            expect(result).toBeUndefined();
        });
    });

    describe('hasPendingDEWSubmit', () => {
        it('should return true when pendingExpenseAction is SUBMIT and isDEWPolicy is true', () => {
            // Given reportMetadata with pendingExpenseAction SUBMIT and isDEWPolicy is true
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            };

            // When checking if there's a pending DEW submit
            const result = ReportActionsUtils.hasPendingDEWSubmit(reportMetadata, true);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false when pendingExpenseAction is SUBMIT but isDEWPolicy is false', () => {
            // Given reportMetadata with pendingExpenseAction SUBMIT but isDEWPolicy is false
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            };

            // When checking if there's a pending DEW submit with isDEWPolicy false
            const result = ReportActionsUtils.hasPendingDEWSubmit(reportMetadata, false);

            // Then it should return false because the policy is not DEW
            expect(result).toBe(false);
        });

        it('should return false when pendingExpenseAction is not SUBMIT', () => {
            // Given reportMetadata with pendingExpenseAction APPROVE (not SUBMIT)
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
            };

            // When checking if there's a pending DEW submit
            const result = ReportActionsUtils.hasPendingDEWSubmit(reportMetadata, true);

            // Then it should return false because pendingExpenseAction is APPROVE, not SUBMIT
            expect(result).toBe(false);
        });

        it('should return false when pendingExpenseAction is undefined', () => {
            // Given reportMetadata without pendingExpenseAction
            const reportMetadata = {};

            // When checking if there's a pending DEW submit
            const result = ReportActionsUtils.hasPendingDEWSubmit(reportMetadata, true);

            // Then it should return false
            expect(result).toBe(false);
        });

        it('should return false when reportMetadata is undefined', () => {
            // Given undefined reportMetadata

            // When checking if there's a pending DEW submit
            const result = ReportActionsUtils.hasPendingDEWSubmit(undefined, true);

            // Then it should return false
            expect(result).toBe(false);
        });
    });

    describe('isDynamicExternalWorkflowApproveFailedAction', () => {
        it('should return true for DEW_APPROVE_FAILED action type', () => {
            // Given a report action with DEW_APPROVE_FAILED action type
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
                created: '2025-11-21',
                reportActionID: '1',
                originalMessage: {
                    message: 'This report cannot be approved because of compliance issues.',
                    automaticAction: false,
                },
                message: [],
                previousMessage: [],
            };

            // When checking if the action is a DEW approve failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowApproveFailedAction(action);

            // Then it should return true because the action type is DEW_APPROVE_FAILED
            expect(result).toBe(true);
        });

        it('should return false for non-DEW_APPROVE_FAILED action type', () => {
            // Given a report action with APPROVED action type (not DEW_APPROVE_FAILED)
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                created: '2025-11-21',
                reportActionID: '1',
                originalMessage: {
                    expenseReportID: '1',
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
                message: [],
                previousMessage: [],
            };

            // When checking if the action is a DEW approve failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowApproveFailedAction(action);

            // Then it should return false because the action type is not DEW_APPROVE_FAILED
            expect(result).toBe(false);
        });

        it('should return false for null action', () => {
            // Given a null action

            // When checking if the action is a DEW approve failed action
            const result = ReportActionsUtils.isDynamicExternalWorkflowApproveFailedAction(null);

            // Then it should return false because the action is null
            expect(result).toBe(false);
        });
    });

    describe('getMostRecentActiveDEWApproveFailedAction', () => {
        it('should return the DEW action when DEW_APPROVE_FAILED exists and no approval action exists', () => {
            // Given report actions containing only a DEW_APPROVE_FAILED action
            const actionId1 = '1';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        message: 'DEW approve failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED>,
            };

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction(reportActions);

            // Then it should return the DEW action because there's no subsequent approval action
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe(actionId1);
        });

        it('should return the DEW action when DEW_APPROVE_FAILED is more recent than APPROVED', () => {
            // Given report actions where DEW_APPROVE_FAILED occurred after APPROVED
            const actionId1 = '1';
            const actionId2 = '2';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        expenseReportID: actionId1,
                        amount: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId2,
                    originalMessage: {
                        message: 'DEW approve failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED>,
            };

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction(reportActions);

            // Then it should return the DEW action because it's more recent than the APPROVED action
            expect(result).toBeDefined();
            expect(result?.reportActionID).toBe(actionId2);
        });

        it('should return undefined when APPROVED is more recent than DEW_APPROVE_FAILED', () => {
            // Given report actions where APPROVED occurred after DEW_APPROVE_FAILED
            const actionId1 = '1';
            const actionId2 = '2';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        message: 'DEW approve failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId2,
                    originalMessage: {
                        expenseReportID: actionId2,
                        amount: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED>,
            };

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction(reportActions);

            // Then it should return undefined because a successful APPROVED action supersedes the DEW failure
            expect(result).toBeUndefined();
        });

        it('should return undefined when FORWARDED is more recent than DEW_APPROVE_FAILED', () => {
            // Given report actions where FORWARDED occurred after DEW_APPROVE_FAILED
            const actionId1 = '1';
            const actionId2 = '2';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
                    created: '2025-11-21 09:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        message: 'DEW approve failed',
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED>,
                [actionId2]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId2,
                    originalMessage: {
                        expenseReportID: actionId2,
                        amount: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED>,
            };

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction(reportActions);

            // Then it should return undefined because a successful FORWARDED action supersedes the DEW failure
            expect(result).toBeUndefined();
        });

        it('should return undefined when no DEW_APPROVE_FAILED action exists', () => {
            // Given report actions containing only an APPROVED action (no DEW failures)
            const actionId1 = '1';
            const reportActions: ReportActions = {
                [actionId1]: {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    created: '2025-11-21 10:00:00',
                    reportActionID: actionId1,
                    originalMessage: {
                        expenseReportID: actionId1,
                        amount: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                    message: [],
                    previousMessage: [],
                } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED>,
            };

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction(reportActions);

            // Then it should return undefined because there are no DEW failures
            expect(result).toBeUndefined();
        });

        it('should return undefined for empty report actions', () => {
            // Given an empty report actions object

            // When getting the most recent active DEW approve failed action
            const result = ReportActionsUtils.getMostRecentActiveDEWApproveFailedAction({});

            // Then it should return undefined because there are no actions
            expect(result).toBeUndefined();
        });
    });

    describe('hasPendingDEWApprove', () => {
        it('should return true when pendingExpenseAction is APPROVE and isDEWPolicy is true', () => {
            // Given reportMetadata with pendingExpenseAction APPROVE and isDEWPolicy is true
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
            };

            // When checking if there's a pending DEW approve
            const result = ReportActionsUtils.hasPendingDEWApprove(reportMetadata, true);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false when pendingExpenseAction is APPROVE but isDEWPolicy is false', () => {
            // Given reportMetadata with pendingExpenseAction APPROVE but isDEWPolicy is false
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
            };

            // When checking if there's a pending DEW approve with isDEWPolicy false
            const result = ReportActionsUtils.hasPendingDEWApprove(reportMetadata, false);

            // Then it should return false because the policy is not DEW
            expect(result).toBe(false);
        });

        it('should return false when pendingExpenseAction is not APPROVE', () => {
            // Given reportMetadata with pendingExpenseAction SUBMIT (not APPROVE)
            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            };

            // When checking if there's a pending DEW approve
            const result = ReportActionsUtils.hasPendingDEWApprove(reportMetadata, true);

            // Then it should return false because pendingExpenseAction is SUBMIT, not APPROVE
            expect(result).toBe(false);
        });

        it('should return false when pendingExpenseAction is undefined', () => {
            // Given reportMetadata without pendingExpenseAction
            const reportMetadata = {};

            // When checking if there's a pending DEW approve
            const result = ReportActionsUtils.hasPendingDEWApprove(reportMetadata, true);

            // Then it should return false
            expect(result).toBe(false);
        });

        it('should return false when reportMetadata is undefined', () => {
            // Given undefined reportMetadata

            // When checking if there's a pending DEW approve
            const result = ReportActionsUtils.hasPendingDEWApprove(undefined, true);

            // Then it should return false
            expect(result).toBe(false);
        });
    });

    describe('isDynamicExternalWorkflowSubmitAction', () => {
        it('should return true for SUBMITTED action if workflow is DYNAMICEXTERNAL', () => {
            // Given a report action with SUBMITTED action type and workflow is DYNAMICEXTERNAL
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW submit action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitAction(action);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false for SUBMITTED action if workflow is not DYNAMICEXTERNAL', () => {
            // Given a report action with SUBMITTED action type and workflow is not DYNAMICEXTERNAL
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    workflow: CONST.POLICY.APPROVAL_MODE.BASIC,
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW submit action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitAction(action);

            // Then it should return false
            expect(result).toBe(false);
        });

        it('should return false for non SUBMITTED action', () => {
            // Given a report action with non SUBMITTED action type
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    expenseReportID: '1',
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW submit action
            const result = ReportActionsUtils.isDynamicExternalWorkflowSubmitAction(action);

            // Then it should return false
            expect(result).toBe(false);
        });
    });

    describe('isDynamicExternalWorkflowForwardedAction', () => {
        it('should return true for FORWARDED action if workflow is DYNAMICEXTERNAL', () => {
            // Given a report action with FORWARDED action type and workflow is DYNAMICEXTERNAL
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                    expenseReportID: '1',
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW forwarded action
            const result = ReportActionsUtils.isDynamicExternalWorkflowForwardedAction(action);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false for FORWARDED action if workflow is not DYNAMICEXTERNAL', () => {
            // Given a report action with FORWARDED action type and workflow is not DYNAMICEXTERNAL
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    workflow: CONST.POLICY.APPROVAL_MODE.BASIC,
                    expenseReportID: '1',
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW forwarded action
            const result = ReportActionsUtils.isDynamicExternalWorkflowForwardedAction(action);

            // Then it should return false
            expect(result).toBe(false);
        });

        it('should return false for non FORWARDED action', () => {
            // Given a report action with non FORWARDED action type
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                created: '2025-11-21',
                previousMessage: [],
                message: [],
                originalMessage: {
                    expenseReportID: '1',
                    amount: 1,
                    currency: CONST.CURRENCY.USD,
                },
            };

            // When checking if the action is a DEW forwarded action
            const result = ReportActionsUtils.isDynamicExternalWorkflowForwardedAction(action);

            // Then it should return false
            expect(result).toBe(false);
        });
    });

    describe('withDEWRoutedActionsArray', () => {
        it('should add a DEW routed action for each DEW SUBMITTED and FORWARDED action', () => {
            // Given a report actions array with DEW SUBMITTED and FORWARDED actions
            const reportActions: ReportAction[] = [
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'},
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '',
                    reportActionID: '2',
                    originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example@gmail.com'},
                },
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'},
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    created: '',
                    reportActionID: '4',
                    originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example2@gmail.com'},
                },
            ];

            // When extending the array with DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const expected: Array<Partial<ReportAction>> = [
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'},
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '',
                    reportActionID: '2',
                    originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example@gmail.com'},
                },
                {actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED, reportActionID: '2DEW', originalMessage: {to: 'example@gmail.com'}},
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'},
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    created: '',
                    reportActionID: '4',
                    originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example2@gmail.com'},
                },
                {actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED, reportActionID: '4DEW', originalMessage: {to: 'example2@gmail.com'}},
            ];
            const actual = ReportActionsUtils.withDEWRoutedActionsArray(reportActions);

            // Then DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action should be added for each SUBMITTED and FORWARDED actions to the array
            for (let i = 0; i < expected.length; i++) {
                expect(actual.at(i)).toEqual(expect.objectContaining(expected.at(i)));
            }
        });

        it(`should not add a DEW routed action if we don't have DEW SUBMITTED or FORWARDED action`, () => {
            // Given a report actions array with no DEW SUBMITTED or FORWARDED actions
            const reportActions: ReportAction[] = [
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, created: '', reportActionID: '2'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED, created: '', reportActionID: '4'},
            ];

            // When extending the array with DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const expected: ReportAction[] = [
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, created: '', reportActionID: '2'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'},
                {actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED, created: '', reportActionID: '4'},
            ];
            const actual = ReportActionsUtils.withDEWRoutedActionsArray(reportActions);

            // Then no DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action should be added to the array
            expect(actual).toEqual(expected);
        });
    });

    describe('withDEWRoutedActionsObject', () => {
        it('should add a DEW routed action for each DEW SUBMITTED and FORWARDED action', () => {
            // Given a report actions collection with DEW SUBMITTED and FORWARDED actions
            const firstAction = {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'};
            const secondAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '',
                reportActionID: '2',
                originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example@gmail.com'},
            };
            const thirdAction = {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'};
            const fourthAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                created: '',
                reportActionID: '4',
                originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'example2@gmail.com'},
            };
            const reportActions: ReportActions = {
                [firstAction.reportActionID]: firstAction,
                [secondAction.reportActionID]: secondAction,
                [thirdAction.reportActionID]: thirdAction,
                [fourthAction.reportActionID]: fourthAction,
            };

            // When extending the collection with DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const secondDEWAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                reportActionID: '2DEW',
                originalMessage: {to: 'example@gmail.com'},
            } as ReportAction;
            const fourthDEWAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                reportActionID: '4DEW',
                originalMessage: {to: 'example2@gmail.com'},
            } as ReportAction;
            const expected: ReportActions = {
                [firstAction.reportActionID]: firstAction,
                [secondAction.reportActionID]: secondAction,
                [secondDEWAction.reportActionID]: secondDEWAction,
                [thirdAction.reportActionID]: thirdAction,
                [fourthAction.reportActionID]: fourthAction,
                [fourthDEWAction.reportActionID]: fourthDEWAction,
            };
            const actual = ReportActionsUtils.withDEWRoutedActionsObject(reportActions);

            // Then DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action should be added for each SUBMITTED and FORWARDED actions to the collection
            expect(actual).toMatchObject(expected);
        });

        it(`should not add a DEW routed action if we don't have DEW SUBMITTED or FORWARDED action`, () => {
            // Given a report actions collection with no DEW SUBMITTED or FORWARDED actions
            const firstAction = {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '1'};
            const secondAction = {actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, created: '', reportActionID: '2'};
            const thirdAction = {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '', reportActionID: '3'};
            const fourthAction = {actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED, created: '', reportActionID: '4'};
            const reportActions: ReportActions = {
                [firstAction.reportActionID]: firstAction,
                [secondAction.reportActionID]: secondAction,
                [thirdAction.reportActionID]: thirdAction,
                [fourthAction.reportActionID]: fourthAction,
            };

            // When extending the collection with DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const expected: ReportActions = {
                [firstAction.reportActionID]: firstAction,
                [secondAction.reportActionID]: secondAction,
                [thirdAction.reportActionID]: thirdAction,
                [fourthAction.reportActionID]: fourthAction,
            };
            const actual = ReportActionsUtils.withDEWRoutedActionsObject(reportActions);

            // Then no DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action should be added to the collection
            expect(actual).toEqual(expected);
        });
    });

    describe('getDynamicExternalWorkflowRoutedMessage', () => {
        it('should return the routed message', () => {
            // Given a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action
            const to = 'example@gmail.com';
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                created: '',
                originalMessage: {to},
            };

            // When getting the DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action message
            const actual = ReportActionsUtils.getDynamicExternalWorkflowRoutedMessage(action, translateLocal);

            // Then it should return the routed due to DEW message with the correct "to" value
            const expected = translateLocal('iou.routedDueToDEW', {to});
            expect(actual).toBe(expected);
        });
    });

    describe('getPolicyChangeLogMaxExpenseAmountMessage', () => {
        it('should return set message when setting from disabled to a value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmount: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                    newMaxExpenseAmount: 10000,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountMessage(translateLocal, action);
            expect(result).toBe('set max expense amount to "$100.00"');
        });

        it('should return removed message when setting to disabled', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmount: 10000,
                    newMaxExpenseAmount: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountMessage(translateLocal, action);
            expect(result).toBe('removed max expense amount (previously "$100.00")');
        });

        it('should return changed message when changing from one value to another', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmount: 10000,
                    newMaxExpenseAmount: 50000,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountMessage(translateLocal, action);
            expect(result).toBe('changed max expense amount to "$500.00" (previously "$100.00")');
        });
    });

    describe('getPolicyChangeLogMaxExpenseAgeMessage', () => {
        it('should return set message when setting from disabled to a value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAge: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                    newMaxExpenseAge: 30,
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAgeMessage(translateLocal, action);
            expect(result).toBe('set max expense age to "30" days');
        });

        it('should return removed message when setting to disabled', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAge: 30,
                    newMaxExpenseAge: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAgeMessage(translateLocal, action);
            expect(result).toBe('removed max expense age (previously "30" days)');
        });

        it('should return changed message when changing from one value to another', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAge: 30,
                    newMaxExpenseAge: 60,
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAgeMessage(translateLocal, action);
            expect(result).toBe('changed max expense age to "60" days (previously "30")');
        });
    });

    describe('getPolicyChangeLogMaxExpenseAmountNoReceiptMessage', () => {
        it('should return set message when setting from disabled to a value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmountNoReceipt: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                    newMaxExpenseAmountNoReceipt: 2500,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translateLocal, action);
            expect(result).toBe('set receipt required amount to "$25.00"');
        });

        it('should return removed message when setting to disabled', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmountNoReceipt: 2500,
                    newMaxExpenseAmountNoReceipt: CONST.POLICY.DISABLED_MAX_EXPENSE_AGE,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translateLocal, action);
            expect(result).toBe('removed receipt required amount (previously "$25.00")');
        });

        it('should return changed message when changing from one value to another', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldMaxExpenseAmountNoReceipt: 2500,
                    newMaxExpenseAmountNoReceipt: 7500,
                    currency: 'USD',
                },
            } as ReportAction;
            const result = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translateLocal, action);
            expect(result).toBe('changed receipt required amount to "$75.00" (previously "$25.00")');
        });
    });

    describe('getCompanyAddressUpdateMessage', () => {
        it('should return "set" message when setting address for first time', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newAddress: {
                        addressStreet: '123 Main St',
                        city: 'San Francisco',
                        state: 'CA',
                        zipCode: '94102',
                        country: 'US',
                    },
                    oldAddress: null,
                },
            } as ReportAction;

            const result = getCompanyAddressUpdateMessage(translateLocal, action);
            expect(result).toBe('set the company address to "123 Main St, San Francisco, CA 94102"');
        });

        it('should return "changed" message when updating existing address', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newAddress: {
                        addressStreet: '456 New Ave',
                        city: 'Los Angeles',
                        state: 'CA',
                        zipCode: '90001',
                        country: 'US',
                    },
                    oldAddress: {
                        addressStreet: '123 Old St',
                        city: 'San Francisco',
                        state: 'CA',
                        zipCode: '94102',
                        country: 'US',
                    },
                },
            } as ReportAction;

            const result = getCompanyAddressUpdateMessage(translateLocal, action);
            expect(result).toBe('changed the company address to "456 New Ave, Los Angeles, CA 90001" (previously "123 Old St, San Francisco, CA 94102")');
        });
        it('should handle address with street2 (newline separated)', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newAddress: {
                        addressStreet: '123 Main St\nSuite 500',
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10001',
                        country: 'US',
                    },
                    oldAddress: null,
                },
            } as ReportAction;

            const result = getCompanyAddressUpdateMessage(translateLocal, action);

            // The new line should be replaced with a comma
            expect(result).toBe('set the company address to "123 Main St, Suite 500, New York, NY 10001"');
        });
    });

    describe('getUpdateACHAccountMessage', () => {
        it('should return "set" message when setting the default bank account for the first time', () => {
            // Given an UPDATE_ACH_ACCOUNT action with only new bank account info
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    bankAccountName: 'Business Checking',
                    maskedBankAccountNumber: 'XXXX1234',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('set the default business bank account to "Business Checking: XXXX1234"');
        });

        it('should return "set" message without bank name when bankAccountName is empty', () => {
            // Given an UPDATE_ACH_ACCOUNT action with only new bank account maskedBankAccountNumber
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    bankAccountName: '',
                    maskedBankAccountNumber: 'XXXX1234',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('set the default business bank account to "XXXX1234"');
        });

        it('should return "removed" message when removing the default bank account', () => {
            // Given an UPDATE_ACH_ACCOUNT action with only old bank account info
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldBankAccountName: 'Business Checking',
                    oldMaskedBankAccountNumber: 'XXXX5678',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('removed the default business bank account "Business Checking: XXXX5678"');
        });

        it('should return "removed" message without bank name when oldBankAccountName is empty', () => {
            // Given an UPDATE_ACH_ACCOUNT action with only old bank account maskedBankAccountNumber
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldBankAccountName: '',
                    oldMaskedBankAccountNumber: 'XXXX5678',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('removed the default business bank account "XXXX5678"');
        });

        it('should return "changed" message when changing from one bank account to another', () => {
            // Given an UPDATE_ACH_ACCOUNT action with both new and old bank account info
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    bankAccountName: 'Savings Account',
                    maskedBankAccountNumber: 'XXXX5678',
                    oldBankAccountName: 'Business Checking',
                    oldMaskedBankAccountNumber: 'XXXX1234',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('changed the default business bank account to "Savings Account: XXXX5678" (previously "Business Checking: XXXX1234")');
        });

        it('should return "changed" message with partial bank names when some names are empty', () => {
            // Given an UPDATE_ACH_ACCOUNT action where new bank has a name but old bank does not
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    bankAccountName: 'Savings Account',
                    maskedBankAccountNumber: 'XXXX5678',
                    oldBankAccountName: '',
                    oldMaskedBankAccountNumber: 'XXXX1234',
                },
            } as ReportAction;

            // When getting the update message
            const result = getUpdateACHAccountMessage(translateLocal, action);

            // Then it should return the correct message
            expect(result).toBe('changed the default business bank account to "Savings Account: XXXX5678" (previously "XXXX1234")');
        });
    });

    describe('getWorkspaceCustomUnitRateUpdatedMessage', () => {
        it('should return the correct message when a rate is enabled', () => {
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE> = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
                created: '',
                originalMessage: {
                    customUnitName: 'Distance',
                    customUnitRateName: 'Default Rate',
                    updatedField: 'enabled',
                    oldValue: false,
                    newValue: true,
                },
            };
            const actual = ReportActionsUtils.getWorkspaceCustomUnitRateUpdatedMessage(translateLocal, action);
            expect(actual).toBe('enabled the Distance rate "Default Rate"');
        });

        it('should return the correct message when a rate is disabled', () => {
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE> = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
                created: '',
                originalMessage: {
                    customUnitName: 'Distance',
                    customUnitRateName: 'Default Rate',
                    updatedField: 'enabled',
                    oldValue: true,
                    newValue: false,
                },
            };
            const actual = ReportActionsUtils.getWorkspaceCustomUnitRateUpdatedMessage(translateLocal, action);
            expect(actual).toBe('disabled the Distance rate "Default Rate"');
        });
    });

    describe('didMessageMentionCurrentUser', () => {
        const currentUserEmail = 'currentuser@example.com';
        const otherUserEmail = 'otheruser@example.com';
        const otherUserAccountID = 456;

        it('should return true when email matches', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        html: `<mention-user>@${currentUserEmail}</mention-user>`,
                        type: 'COMMENT',
                        text: `@${currentUserEmail}`,
                    },
                ],
                originalMessage: {
                    html: `<mention-user>@${currentUserEmail}</mention-user>`,
                    whisperedTo: [],
                    mentionedAccountIDs: [],
                },
            };

            const result = ReportActionsUtils.didMessageMentionCurrentUser(reportAction, currentUserEmail);
            expect(result).toBe(true);
        });

        it('should return true when message includes mention-here', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        html: 'Hello <mention-here>',
                        type: 'COMMENT',
                        text: 'Hello @here',
                    },
                ],
                originalMessage: {
                    html: 'Hello <mention-here>',
                    whisperedTo: [],
                    mentionedAccountIDs: [],
                },
            };

            const result = ReportActionsUtils.didMessageMentionCurrentUser(reportAction, currentUserEmail);
            expect(result).toBe(true);
        });

        it('should return false when user is not mentioned', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        html: `<mention-user>@${otherUserEmail}</mention-user>`,
                        type: 'COMMENT',
                        text: `@${otherUserEmail}`,
                    },
                ],
                originalMessage: {
                    html: `<mention-user>@${otherUserEmail}</mention-user>`,
                    whisperedTo: [],
                    mentionedAccountIDs: [otherUserAccountID],
                },
            };

            const result = ReportActionsUtils.didMessageMentionCurrentUser(reportAction, currentUserEmail);
            expect(result).toBe(false);
        });
    });

    describe('getReportActionActorAccountID', () => {
        it('should return report owner account id if action is REPORTPREVIEW and report is a policy expense chat', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return report manager account id if action is REPORTPREVIEW and report is not a policy expense chat', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(20);
        });

        it('should return admin account id if action is SUBMITTED taken by an admin on behalf the submitter', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                adminAccountID: 30,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(30);
        });

        it('should return report owner account id if action is SUBMITTED taken by the submitter himself', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return admin account id if action is SUBMITTED_AND_CLOSED taken by an admin on behalf the submitter', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                adminAccountID: 30,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(30);
        });

        it('should return report owner account id if action is SUBMITTED_AND_CLOSED taken by the submitter himself', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return original actor account id if action is ADDCOMMENT', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: 123,
            };
            const iouReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(123);
        });

        it('returns CONCIERGE for CREATED action when report is harvest-created', async () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                actorAccountID: 9999,
            };

            const iouReport: Report = {...createRandomReport(0, undefined)};
            const report: Report = {
                ...createRandomReport(1, undefined),
                reportID: 'harvest-report-1',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport.reportID}`, {
                origin: 'harvest',
                originalID: 'orig-123',
            });
            await waitForBatchedUpdates();

            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);
        });

        it('returns reportAction.actorAccountID for CREATED action when not harvest-created', async () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                actorAccountID: 9999,
            };

            const iouReport: Report = {...createRandomReport(0, undefined)};
            const report: Report = {
                ...createRandomReport(2, undefined),
                reportID: 'normal-report-2',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport.reportID}`, {});
            await waitForBatchedUpdates();

            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toBe(9999);
        });
    });

    describe('getInvoiceCompanyNameUpdateMessage', () => {
        it('should return the correct message when changing invoice company name with previous value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newValue: 'New Company Name',
                    oldValue: 'Old Company Name',
                },
                message: [],
            } as ReportAction;

            const result = getInvoiceCompanyNameUpdateMessage(translateLocal, action);
            expect(result).toBe('changed the invoice company name to "New Company Name" (previously "Old Company Name")');
        });

        it('should return the correct message when setting invoice company name without previous value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newValue: 'New Company Name',
                },
                message: [],
            } as ReportAction;

            const result = getInvoiceCompanyNameUpdateMessage(translateLocal, action);
            expect(result).toBe('set the invoice company name to "New Company Name"');
        });
    });

    describe('getInvoiceCompanyWebsiteUpdateMessage', () => {
        it('should return the correct message when changing invoice company website with previous value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newValue: 'https://newwebsite.com',
                    oldValue: 'https://oldwebsite.com',
                },
                message: [],
            } as ReportAction;

            const result = getInvoiceCompanyWebsiteUpdateMessage(translateLocal, action);
            expect(result).toBe('changed the invoice company website to "https://newwebsite.com" (previously "https://oldwebsite.com")');
        });

        it('should return the correct message when setting invoice company website without previous value', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    newValue: 'https://newwebsite.com',
                },
                message: [],
            } as ReportAction;

            const result = getInvoiceCompanyWebsiteUpdateMessage(translateLocal, action);
            expect(result).toBe('set the invoice company website to "https://newwebsite.com"');
        });
    });
});
