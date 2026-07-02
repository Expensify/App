import {getAddExpensifyCardRuleMessage, getRemoveExpensifyCardRuleMessage, getUpdateExpensifyCardRuleMessage} from '@libs/SpendRuleChangeLogUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {ReportAction} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('SpendRuleChangeLogUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    describe('getAddExpensifyCardRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe('');
        });

        it('returns allow message with no filters and no named card', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    cards: [],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe('allowed on the card');
        });

        it('returns allow message with single named card and no filters', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe("allowed on 'My Visa'");
        });

        it('returns block message with merchant filter', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    merchants: ['Starbucks'],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe("blocked 'Starbucks' on 'My Visa'");
        });

        it('returns allow message with category filter', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    categories: [CONST.SPEND_RULES.CATEGORIES.DINING],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe("allowed 'Dining' on 'My Visa'");
        });

        it('returns block message with amount-over filter', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    currency: CONST.CURRENCY.USD,
                    amounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['100.00']}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe("blocked amounts over $100.00 on 'My Visa'");
        });

        it('returns allow message with merchant and amount-under filter joined', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    currency: CONST.CURRENCY.USD,
                    merchants: ['Amazon'],
                    amounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: ['50.00']}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe("allowed 'Amazon' and amounts under $50.00 on 'My Visa'");
        });

        it('returns message with multiple-cards summary', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    cards: [
                        {cardID: 1, displayName: 'Card A'},
                        {cardID: 2, displayName: 'Card B'},
                    ],
                },
            } as ReportAction;
            expect(getAddExpensifyCardRuleMessage(translateLocal, action)).toBe('allowed on 2 cards');
        });
    });

    describe('getUpdateExpensifyCardRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe('');
        });

        it('returns mode-change message when only action changed', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    oldAction: CONST.SPEND_RULES.ACTION.ALLOW,
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("changed spend rule from only allow to block on 'My Visa'");
        });

        it('returns applied-to-additional-cards message when only new cards were added', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldCards: [{cardID: 1, displayName: 'Card A'}],
                    cards: [
                        {cardID: 1, displayName: 'Card A'},
                        {cardID: 2, displayName: 'Card B'},
                    ],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe('applied spend rule to 1 additional card');
        });

        it('returns remove-rule message when only cards were removed', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldCards: [
                        {cardID: 1, displayName: 'Card A'},
                        {cardID: 2, displayName: 'Card B'},
                    ],
                    cards: [{cardID: 1, displayName: 'Card A'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("removed spend rule from 'Card B'");
        });

        it('returns added-merchant message with adjective for allow action', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldMerchants: [],
                    merchants: ['Starbucks'],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("added allowed merchant 'Starbucks' on 'My Visa'");
        });

        it('returns changed-category message when single category was swapped', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    oldCategories: [CONST.SPEND_RULES.CATEGORIES.AIRLINES],
                    categories: [CONST.SPEND_RULES.CATEGORIES.DINING],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("changed blocked spend category from 'Airlines' to 'Dining' on 'My Visa'");
        });

        it('returns set-max-amount message when amount is newly added', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    currency: CONST.CURRENCY.USD,
                    oldAmounts: [],
                    amounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['100.00']}],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("set max amount to $100.00 on 'My Visa'");
        });

        it('returns changed-max-amount message when amount value changes', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    currency: CONST.CURRENCY.USD,
                    oldAmounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['50.00']}],
                    amounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['100.00']}],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("changed max amount from $50.00 to $100.00 on 'My Visa'");
        });

        it('returns remove currency limit message when currencies are cleared', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldCurrencies: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: [CONST.CURRENCY.USD]}],
                    currencies: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: []}],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("removed the currency restriction from 'My Visa'");
        });

        it('returns removed-currency-restriction message with max amount when currencies are cleared', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    currency: CONST.CURRENCY.USD,
                    oldCurrencies: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: ['AED', 'AFN', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', CONST.CURRENCY.USD]}],
                    currencies: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: []}],
                    oldAmounts: [],
                    amounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['2.00']}],
                    oldCards: [{cardID: 33, displayName: 'Card Number 33'}],
                    cards: [{cardID: 33, displayName: 'Card Number 33'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("removed the currency restriction and set max amount to $2.00 on 'Card Number 33'");
        });

        it('returns removed-max-amount message when amount is cleared', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.BLOCK,
                    currency: CONST.CURRENCY.USD,
                    oldAmounts: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: ['100.00']}],
                    amounts: [],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("removed max amount from 'My Visa'");
        });

        it('does not repeat spend category noun when multiple categories are added', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldCategories: [CONST.SPEND_RULES.CATEGORIES.DINING],
                    categories: [CONST.SPEND_RULES.CATEGORIES.DINING, CONST.SPEND_RULES.CATEGORIES.GROCERIES, CONST.SPEND_RULES.CATEGORIES.HOTELS],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("added allowed spend category 'Groceries' and 'Hotels' on 'My Visa'");
        });

        it('does not repeat merchant noun when multiple merchants are added', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldMerchants: ['Starbucks'],
                    merchants: ['Starbucks', 'Amazon', 'Walmart'],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe("added allowed merchant 'Amazon' and 'Walmart' on 'My Visa'");
        });

        it('does not repeat nouns when adding multiple merchants and removing multiple categories', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    action: CONST.SPEND_RULES.ACTION.ALLOW,
                    oldMerchants: [],
                    merchants: ['Amazon', 'Walmart'],
                    oldCategories: [CONST.SPEND_RULES.CATEGORIES.DINING, CONST.SPEND_RULES.CATEGORIES.GROCERIES, CONST.SPEND_RULES.CATEGORIES.HOTELS],
                    categories: [CONST.SPEND_RULES.CATEGORIES.DINING],
                    oldCards: [{cardID: 1, displayName: 'My Visa'}],
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getUpdateExpensifyCardRuleMessage(translateLocal, action)).toBe(
                "added allowed merchant 'Amazon', 'Walmart', removed allowed spend category 'Groceries', and 'Hotels' on 'My Visa'",
            );
        });
    });

    describe('getRemoveExpensifyCardRuleMessage', () => {
        it('returns empty string for wrong action type', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {},
            } as ReportAction;
            expect(getRemoveExpensifyCardRuleMessage(translateLocal, action)).toBe('');
        });

        it('returns message with single named card', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    cards: [{cardID: 1, displayName: 'My Visa'}],
                },
            } as ReportAction;
            expect(getRemoveExpensifyCardRuleMessage(translateLocal, action)).toBe("removed spend rule from 'My Visa'");
        });

        it('returns message with multiple-cards summary', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    cards: [
                        {cardID: 1, displayName: 'Card A'},
                        {cardID: 2, displayName: 'Card B'},
                    ],
                },
            } as ReportAction;
            expect(getRemoveExpensifyCardRuleMessage(translateLocal, action)).toBe('removed spend rule from 2 cards');
        });

        it('returns message with fallback "the card" when cards list is empty', () => {
            const action = {
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE,
                reportActionID: '1',
                created: '',
                originalMessage: {
                    cards: [],
                },
            } as ReportAction;
            expect(getRemoveExpensifyCardRuleMessage(translateLocal, action)).toBe('removed spend rule from the card');
        });
    });
});
