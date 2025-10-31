import {getForReportAction, getMovedFromOrToReportMessage, getMovedReportID} from '@libs/ModifiedExpenseMessage';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {translate} from '@src/libs/Localize';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const MOVED_TO_REPORT_ID = '1';
const MOVED_FROM_REPORT_ID = '2';

describe('ModifiedExpenseMessage', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        // The `getReportName` method is quite complex, and we don't need to test it here
        jest.spyOn(ReportUtils, 'getReportName').mockImplementation((report) => report?.reportName ?? '');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMovedReportID', () => {
        describe('when the report action is a modified expense action', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    movedToReportID: MOVED_TO_REPORT_ID,
                    movedFromReport: MOVED_FROM_REPORT_ID,
                },
            };

            it('returns the movedToReportID when type is REPORT_MOVE_TYPE.TO and movedToReportID exists in reportAction', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toEqual(MOVED_TO_REPORT_ID);
            });

            it('returns the movedFromReport when type is REPORT_MOVE_TYPE.FROM and movedFromReport exists in reportAction', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toEqual(MOVED_FROM_REPORT_ID);
            });
        });
        describe('when the report action is not a modified expense action', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    movedToReportID: MOVED_TO_REPORT_ID,
                    movedFromReport: MOVED_FROM_REPORT_ID,
                },
            };

            it('returns undefined for REPORT_MOVE_TYPE.TO  type', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toBeUndefined();
            });

            it('returns undefined for REPORT_MOVE_TYPE.FROM type', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toBeUndefined();
            });
        });
        describe('when the original message is missing movedToReportID or movedFromReport', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {},
            };

            it('returns undefined for REPORT_MOVE_TYPE.TO type when movedToReportID is missing', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO);
                expect(result).toBeUndefined();
            });

            it('returns undefined for REPORT_MOVE_TYPE.FROM type when movedFromReport is missing', () => {
                const result = getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM);
                expect(result).toBeUndefined();
            });
        });
    });

    describe('getMovedFromOrToReportMessage', () => {
        describe('when moving to a report', () => {
            it('returns "moved expense to personal space" message when moving an expense to selfDM', () => {
                const selfDMReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);
                const result = getMovedFromOrToReportMessage(undefined, selfDMReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedToPersonalSpace');
                expect(result).toEqual(expectedResult);
            });
            it('returns "moved expense from personal space to chat with reportName" message when moving an expense to policy expense chat with only reportName', () => {
                const policyExpenseReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {
                    reportName: policyExpenseReport.reportName,
                });
                expect(result).toEqual(expectedResult);
            });
            it('returns "moved expense from personal space to policyName" message when moving an expense to policy expense chat with reportName and policyName', () => {
                const policyExpenseReport = {
                    ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                    policyName: 'Policy',
                };
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {
                    reportName: policyExpenseReport.reportName,
                    workspaceName: policyExpenseReport.policyName,
                });
                expect(result).toEqual(expectedResult);
            });
            it('returns "changed the expense" message when moving an expense to policy expense chat without reportName', () => {
                const policyExpenseReport = {
                    ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                    reportName: '',
                };
                const result = getMovedFromOrToReportMessage(undefined, policyExpenseReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.changedTheExpense');
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving from a report', () => {
            const movedFromReport = {
                ...createRandomReport(1, undefined),
            };

            it('returns "moved expense from reportName" message', () => {
                const result = getMovedFromOrToReportMessage(movedFromReport, undefined);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromReport', {
                    reportName: movedFromReport.reportName ?? '',
                });
                expect(result).toEqual(expectedResult);
            });

            it('returns "moved an expense" when reportName is empty', () => {
                const reportWithoutName = {
                    ...createRandomReport(1, undefined),
                    reportName: '',
                };
                const result = getMovedFromOrToReportMessage(reportWithoutName, undefined);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromReport', {
                    reportName: '',
                });

                expect(result).toEqual(expectedResult);
            });
        });

        it('returns undefined when neither movedToReport nor movedFromReport is provided', () => {
            const result = getMovedFromOrToReportMessage(undefined, undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getForAction', () => {
        const report = createRandomReport(1, undefined);
        describe('when the amount is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `changed the amount to $18.00 (previously $12.55)`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed while the original value was partial', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 0,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the amount to $18.00`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed and the description is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55)\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55)\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult =
                    'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount, comment and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                    newComment: 'I bought it on the way',
                    oldComment: 'from the business trip',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult =
                    'changed the amount to $18.00 (previously $12.55), the description to "I bought it on the way" (previously "from the business trip"), and the merchant to "Taco Bell" (previously "Big Belly")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the merchant (previously "Big Belly")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is changed while the previous merchant was partial', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'KFC',
                    oldMerchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the merchant to "KFC"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is cleared to PARTIAL_TRANSACTION_MERCHANT', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                    oldMerchant: 'Old Merchant',
                },
            };

            it('returns the correct "removed" text message', () => {
                const expectedResult = `removed the merchant (previously "Old Merchant")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is changed from one valid merchant to another', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: 'New Merchant',
                    oldMerchant: 'Old Merchant',
                },
            };

            it('returns the correct "changed" text message', () => {
                const expectedResult = `changed the merchant to "New Merchant" (previously "Old Merchant")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the description (previously "mini shore") and the merchant (previously "Big Belly")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant, the category and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                    category: '',
                    oldCategory: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the description (previously "mini shore"), the merchant (previously "Big Belly"), and the category (previously "Benefits")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the merchant to "Big Belly"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant and the description are set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the description to "mini shore" and the merchant to "Big Belly"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant, the category and the description are set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                    oldCategory: '',
                    category: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `set the description to "mini shore", the merchant to "Big Belly", and the category to "Benefits"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the created date is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    created: '2023-12-27',
                    oldCreated: '2023-12-26',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the date to 2023-12-27 (previously 2023-12-26)';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the created date was not changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    created: '2023-12-27',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'changed the expense';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '1.00 mi @ $0.70 / mi',
                    merchant: '10.00 mi @ $0.70 / mi',
                    oldAmount: 70,
                    amount: 700,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the distance is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the distance to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $7.00 (previously $0.70)`;
                const result = getForReportAction({reportAction, policyID: report.policyID});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance rate is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '56.36 mi @ $0.70 / mi',
                    merchant: '56.36 mi @ $0.99 / mi',
                    oldAmount: 3945,
                    amount: 5580,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the rate is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the rate to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $55.80 (previously $39.45)`;
                const result = getForReportAction({reportAction, policyID: report.policyID});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving an expense', () => {
            it('returns the movedFromOrToReportMessage message when provided', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                };

                const expectedResult = 'moved an expense';

                const movedFromReport = {
                    ...createRandomReport(1, undefined),
                    reportName: '',
                };

                const result = getForReportAction({reportAction, policyID: report.policyID, movedFromReport});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is changed with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: 'Food',
                    source: 'agentZero',
                },
            };

            it('returns the correct text message with AI attribution', () => {
                const expectedResult = `changed the category based on past activity to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is changed with MCC attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: 'Food',
                    source: 'mccMapping',
                },
            };

            it('returns the correct text message with MCC attribution', () => {
                const expectedResult = `changed the category based on workspace rule to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is set with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: '',
                    source: 'agentZero',
                },
            };

            it('returns the correct text message with AI attribution', () => {
                const expectedResult = `set the category based on past activity to "Travel"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is removed with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: '',
                    oldCategory: 'Travel',
                    source: 'agentZero',
                },
            };

            it('returns the correct text message with AI attribution', () => {
                const expectedResult = `removed the category based on past activity (previously "Travel")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is changed without source (backward compatibility)', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: 'Food',
                },
            };

            it('returns the correct text message without attribution', () => {
                const expectedResult = `changed the category to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is changed with manual source', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: 'Food',
                    source: 'manual',
                },
            };

            it('returns the correct text message without attribution', () => {
                const expectedResult = `changed the category to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
