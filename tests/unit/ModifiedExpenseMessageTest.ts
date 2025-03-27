import Onyx from 'react-native-onyx';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import CONST from '@src/CONST';
import {translate} from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('ModifiedExpenseMessage', () => {
    describe('getForAction', () => {
        const report = createRandomReport(1);
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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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

                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});

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
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});
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
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: report.reportID, reportAction});
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when moving an expense', () => {
            beforeEach(() => Onyx.clear());
            it('return the message "moved expense to personal space" when moving an expense from an expense chat or 1:1 DM to selfDM', async () => {
                // Given the selfDM report and report action
                const selfDMReport = {
                    ...report,
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                };
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        movedToReportID: selfDMReport.reportID,
                    },
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}`, {[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`]: selfDMReport});
                await waitForBatchedUpdates();

                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedToPersonalSpace');

                // When the expense is moved from an expense chat or 1:1 DM to selfDM
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: selfDMReport.reportID, reportAction});
                // Then it should return the correct text message
                expect(result).toEqual(expectedResult);
            });

            it('return the message "changed the expense" when reportName and workspace name are empty', async () => {
                // Given the policyExpenseChat with reportName is empty and report action
                const policyExpenseChat = {
                    ...report,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    reportName: '',
                    isOwnPolicyExpenseChat: false,
                };
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        movedToReportID: policyExpenseChat.reportID,
                    },
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}`, {[`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`]: policyExpenseChat});
                await waitForBatchedUpdates();

                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.changedTheExpense');

                // When the expense is moved to an expense chat with reportName empty
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: policyExpenseChat.reportID, reportAction});
                // Then it should return the correct text message
                expect(result).toEqual(expectedResult);
            });

            it('return the message "moved expense from personal space to policyName" when both reportName and policyName are present', async () => {
                // Given the policyExpenseChat with both reportName and policyName are present and report action
                const policyExpenseChat = {
                    ...report,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                    policyName: 'fake policyName',
                };
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        movedToReportID: policyExpenseChat.reportID,
                    },
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}`, {[`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`]: policyExpenseChat});
                await waitForBatchedUpdates();

                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {
                    reportName: policyExpenseChat.reportName,
                    workspaceName: policyExpenseChat.policyName,
                });

                // When the expense is moved to an expense chat with both reportName and policyName are present
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: policyExpenseChat.reportID, reportAction});
                // Then it should return the correct text message
                expect(result).toEqual(expectedResult);
            });

            it('return the message "moved expense from personal space to chat with reportName" when only reportName is present', async () => {
                // Given the policyExpenseChat with only reportName is present and report action
                const policyExpenseChat = {
                    ...report,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                };
                const reportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                    originalMessage: {
                        movedToReportID: policyExpenseChat.reportID,
                    },
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}`, {[`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`]: policyExpenseChat});
                await waitForBatchedUpdates();

                const expectedResult = translate(CONST.LOCALES.EN as 'en', 'iou.movedFromPersonalSpace', {reportName: policyExpenseChat.reportName});

                // When the expense is moved to an expense chat with only reportName is present
                const result = ModifiedExpenseMessage.getForReportAction({reportOrID: policyExpenseChat.reportID, reportAction});
                // Then it should return the correct text message
                expect(result).toEqual(expectedResult);
            });
        });
    });
});
