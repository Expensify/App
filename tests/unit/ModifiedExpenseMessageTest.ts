import {getForReportAction, getMovedFromOrToReportMessage, getMovedReportID} from '@libs/ModifiedExpenseMessage';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as PolicyUtils from '@libs/PolicyUtils';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {translate} from '@src/libs/Localize';
import type {Policy} from '@src/types/onyx';
import type {OriginalMessageModifiedExpense} from '@src/types/onyx/OriginalMessage';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import {translateLocal} from '../utils/TestHelper';
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
                const result = getMovedFromOrToReportMessage(translateLocal, undefined, selfDMReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedToPersonalSpace');
                expect(result).toEqual(expectedResult);
            });
            it('returns "moved expense from personal space to chat with reportName" message when moving an expense to policy expense chat with only reportName', () => {
                const policyExpenseReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                const result = getMovedFromOrToReportMessage(translateLocal, undefined, policyExpenseReport);
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
                const result = getMovedFromOrToReportMessage(translateLocal, undefined, policyExpenseReport);
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
                const result = getMovedFromOrToReportMessage(translateLocal, undefined, policyExpenseReport);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.changedTheExpense');
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving from a report', () => {
            const movedFromReport = {
                ...createRandomReport(1, undefined),
            };

            it('returns "moved expense from reportName" message', () => {
                const result = getMovedFromOrToReportMessage(translateLocal, movedFromReport, undefined);
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
                const result = getMovedFromOrToReportMessage(translateLocal, reportWithoutName, undefined);
                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromReport', {
                    reportName: '',
                });

                expect(result).toEqual(expectedResult);
            });
        });

        it('returns undefined when neither movedToReport nor movedFromReport is provided', () => {
            const result = getMovedFromOrToReportMessage(translateLocal, undefined, undefined);
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

        describe('when the amount is changed from zero', () => {
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
                const expectedResult = `changed the amount to $18.00 (previously $0.00)`;

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

        describe('when the description is set with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldComment: '',
                    newComment: 'Flight to client meeting',
                    aiGenerated: true,
                },
            };

            it('returns the correct text message with AI attribution when setting description', () => {
                const expectedResult = 'set the description based on past activity to "Flight to client meeting"';

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the description is changed with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldComment: 'Old description',
                    newComment: 'New description',
                    aiGenerated: true,
                },
            };

            it('returns the correct text message with AI attribution when changing description', () => {
                const expectedResult = 'changed the description based on past activity to "New description" (previously "Old description")';

                const result = getForReportAction({reportAction, policyID: report.policyID});

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
                    source: CONST.CATEGORY_SOURCE.AI,
                } as OriginalMessageModifiedExpense,
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
                    source: CONST.CATEGORY_SOURCE.MCC,
                } as OriginalMessageModifiedExpense,
            };

            it('returns the correct text message with MCC attribution for non-admin', () => {
                const expectedResult = `changed the category based on workspace rule to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct workspace rules link for admin', () => {
                // The shouldConvertToLowercase: !source parameter prevents buildMessageFragmentForValue
                // from calling .toLowerCase() on the entire HTML anchor tag, which would corrupt
                // the policyID in the href attribute and cause navigation to fail.

                const mockPolicy: Policy = {
                    id: 'AbC123XyZ789', // Mixed case to verify exact preservation
                    name: 'Test Policy',
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    owner: 'test@example.com',
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                };

                jest.spyOn(PolicyUtils, 'getPolicy').mockReturnValue(mockPolicy);
                jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(true);

                const result = getForReportAction({reportAction, policyID: mockPolicy.id});

                // Verify the policyID in the URL exactly matches the policy.id (case-preserved)
                expect(result).toContain(`workspaces/${mockPolicy.id}/rules`);
                expect(result).toContain('href=');
                expect(result).toContain('workspace rules</a>');
            });
        });

        describe('when the category is set with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: 'Travel',
                    oldCategory: '',
                    source: CONST.CATEGORY_SOURCE.AI,
                } as OriginalMessageModifiedExpense,
            };

            it('returns the correct text message with AI attribution', () => {
                const expectedResult = `set the category based on past activity to "Travel"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is changed from Uncategorized with AI attribution', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: '6403 Travel - Member Services',
                    oldCategory: 'Uncategorized',
                    source: CONST.CATEGORY_SOURCE.AI,
                } as OriginalMessageModifiedExpense,
            };

            it('returns the correct text message without showing previously uncategorized', () => {
                const expectedResult = `set the category based on past activity to "6403 Travel - Member Services"`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the category is cleared from Uncategorized (both missing)', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    category: '',
                    oldCategory: 'Uncategorized',
                } as OriginalMessageModifiedExpense,
            };

            it('returns the generic changed expense message since no meaningful change occurred', () => {
                const expectedResult = `changed the expense`;

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
                    source: CONST.CATEGORY_SOURCE.AI,
                } as OriginalMessageModifiedExpense,
            };

            it('returns the correct text message with AI attribution', () => {
                const expectedResult = `removed the category based on past activity (previously "Travel")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when', () => {
            it('returns the correct text message', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        policyID: '1234',
                        policyRulesModifiedFields: {
                            category: 'Travel',
                            merchant: "McDonald's",
                            billable: true,
                            reimbursable: true,
                        },
                    } as OriginalMessageModifiedExpense,
                };

                const result = getForReportAction({reportAction, policyID: report.policyID});

                const expectedResult = `set the category to "Travel", merchant to "McDonald\'s", marked the expense as "billable", and marked the expense as "reimbursable" via <a href="'.URL_TO_NEW_DOT.'/workspaces/1234/rules">workspace rules</a>`;

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct text message', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        policyID: '1234',
                        policyRulesModifiedFields: {
                            category: 'Travel',
                            merchant: "McDonald's",
                        },
                    } as OriginalMessageModifiedExpense,
                };

                const result = getForReportAction({reportAction, policyID: report.policyID});

                const expectedResult = `set the category to "Travel", and merchant to "McDonald\'s" via <a href="'.URL_TO_NEW_DOT.'/workspaces/1234/rules">workspace rules</a>`;

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct text message', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        policyID: '1234',
                        policyRulesModifiedFields: {
                            billable: true,
                        },
                    } as OriginalMessageModifiedExpense,
                };

                const result = getForReportAction({reportAction, policyID: report.policyID});

                const expectedResult = `marked the expense as "billable" via <a href="'.URL_TO_NEW_DOT.'/workspaces/1234/rules">workspace rules</a>`;

                expect(result).toEqual(expectedResult);
            });

            it('returns the correct text message', () => {
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        policyID: '1234',
                        policyRulesModifiedFields: {
                            reimbursable: true,
                            billable: true,
                        },
                    } as OriginalMessageModifiedExpense,
                };

                const result = getForReportAction({reportAction, policyID: report.policyID});

                const expectedResult = `marked the expense as "reimbursable" and marked the expense as "billable" via <a href="'.URL_TO_NEW_DOT.'/workspaces/1234/rules">workspace rules</a>`;

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
                } as OriginalMessageModifiedExpense,
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
                    source: CONST.CATEGORY_SOURCE.MANUAL,
                } as OriginalMessageModifiedExpense,
            };

            it('returns the correct text message without attribution', () => {
                const expectedResult = `changed the category to "Travel" (previously "Food")`;

                const result = getForReportAction({reportAction, policyID: report.policyID});

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
