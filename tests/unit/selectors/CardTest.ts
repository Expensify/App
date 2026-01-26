/* eslint-disable @typescript-eslint/naming-convention */
import {defaultExpensifyCardSelector} from '@hooks/useSearchTypeMenuSections';
import CONST from '@src/CONST';
import type {CardList} from '@src/types/onyx';
import {createRandomCompanyCard, createRandomExpensifyCard} from '../../utils/collections/card';

describe('defaultExpensifyCardSelector', () => {
    it('Should return undefined if allCards is undefined or empty', () => {
        expect(defaultExpensifyCardSelector(undefined)).toBeUndefined();
        expect(defaultExpensifyCardSelector({})).toBeUndefined();
    });

    it('Should return undefined if cards do not have Expensify Card bank', () => {
        const allCards: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomCompanyCard(2, {bank: 'stripe'}),
        };

        expect(defaultExpensifyCardSelector(allCards)).toBeUndefined();
    });

    it('Should return undefined if Expensify Card does not have fundID', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: undefined}),
            '2': createRandomExpensifyCard(2, {fundID: ''}),
        };

        expect(defaultExpensifyCardSelector(allCards)).toBeUndefined();
    });

    it('Should return the first Expensify Card feed when multiple Expensify Cards exist', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: '5555'}),
            '2': createRandomExpensifyCard(2, {fundID: '6666'}),
        };
        const result = defaultExpensifyCardSelector(allCards);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });

    it('Should return the first Expensify Card feed when mixed cards exist (some Expensify, some not)', () => {
        const allCards: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomExpensifyCard(2, {fundID: '5555'}),
            '3': createRandomExpensifyCard(3, {fundID: '6666'}),
        };

        const result = defaultExpensifyCardSelector(allCards);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });

    it('Should ignore Expensify Cards without fundID when other Expensify Cards with fundID exist', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: undefined}),
            '2': createRandomExpensifyCard(2, {fundID: '5555'}),
        };
        const result = defaultExpensifyCardSelector(allCards);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });
});
