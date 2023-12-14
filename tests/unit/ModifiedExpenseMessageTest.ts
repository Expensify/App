import {randAmount} from '@ngneat/falso';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import CONST from '@src/CONST';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {Transaction} from '../../src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction(amount, currency, reportID, comment, created);

    return {...baseValues, ...values};
}

describe('ModifiedExpenseMessage', () => {
    describe('getForAction', () => {
        describe('when the amount is changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
                originalMessage: {
                    amount: 1800,
                    currency: CONST.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST.CURRENCY.USD,
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `changed the amount to $18.00 (previously $12.55).`;

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed and the description is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55).' + '\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount is changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55).' + '\nset the category to "Benefits".' + '\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount and merchant are changed, the description is removed, and category is set', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly").' + '\nset the category to "Benefits".' + '\nremoved the description (previously "this is for the shuttle").';

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the amount, comment and merchant are changed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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
                const expectedResult = 'changed the amount to $18.00 (previously $12.55), the description to "I bought it on the way" (previously "from the business trip"), and the merchant to "Taco Bell" (previously "Big Belly").';

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant is removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the merchant (previously "Big Belly").`;

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
                originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'minishore',
                },
            };

            it('returns the correct text message', () => {
                const expectedResult = `removed the description (previously "minishore") and the merchant (previously "Big Belly").`;

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the merchant, the category and the description are removed', () => {
            const reportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
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
                const expectedResult = `removed the description (previously "minishore"), the merchant (previously "Big Belly"), and the category (previously "Benefits").`;

                const result = ModifiedExpenseMessage.getForReportAction(reportAction);

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
