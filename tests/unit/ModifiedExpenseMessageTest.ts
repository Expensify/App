import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import CONST from '@src/CONST';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';

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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55).';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'set the amount to $18.00.';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55).\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55).\nset the category to "Benefits".\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly").\nset the category to "Benefits".\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    'changed the amount to $18.00 (previously $12.55), the description to "I bought it on the way" (previously "from the business trip"), and the merchant to "Taco Bell" (previously "Big Belly").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'removed the merchant (previously "Big Belly").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'set the merchant to "KFC".';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    oldComment: 'minishore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'removed the description (previously "minishore") and the merchant (previously "Big Belly").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    oldComment: 'minishore',
                    category: '',
                    oldCategory: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'removed the description (previously "minishore"), the merchant (previously "Big Belly"), and the category (previously "Benefits").';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'set the merchant to "Big Belly".';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    newComment: 'minishore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'set the description to "minishore" and the merchant to "Big Belly".';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                    newComment: 'minishore',
                    oldCategory: '',
                    category: 'Benefits',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = 'set the description to "minishore", the merchant to "Big Belly", and the category to "Benefits".';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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
                const expectedResult = 'changed the date to 2023-12-27 (previously 2023-12-26).';

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

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

                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '1.00 mi @ $0.67 / mi',
                    merchant: '10.00 mi @ $0.67 / mi',
                    oldAmount: 67,
                    amount: 670,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the distance is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the distance to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $6.70 (previously $0.67)`;
                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);
                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the distance rate is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    oldMerchant: '56.36 mi @ $0.67 / mi',
                    merchant: '56.36 mi @ $0.99 / mi',
                    oldAmount: 3776,
                    amount: 5580,
                    oldCurrency: CONST.CURRENCY.USD,
                    currency: CONST.CURRENCY.USD,
                },
            };

            it('then the message says the rate is changed and shows the new and old merchant and amount', () => {
                const expectedResult = `changed the rate to ${reportAction.originalMessage.merchant} (previously ${reportAction.originalMessage.oldMerchant}), which updated the amount to $55.80 (previously $37.76)`;
                const result = ModifiedExpenseMessage.getForReportAction(report.reportID, reportAction);
                expect(result).toEqual(expectedResult);
            });
        });
    });
});
