import {isSelectableTaxRate} from '@libs/CategoryTaxRulesUtils';

import CONST from '@src/CONST';
import type {TaxRate} from '@src/types/onyx/Policy';

import createMock from '../utils/createMock';

describe('CategoryTaxRulesUtils', () => {
    describe('isSelectableTaxRate', () => {
        it('offers a rate the workspace still has', () => {
            // Given an ordinary tax rate
            const taxRate = createMock<TaxRate>({name: 'VAT', value: '5%'});

            // When a rule's tax picker asks whether it can be chosen
            // Then it can, including the workspace default, which a rule may set like any other rate
            expect(isSelectableTaxRate(taxRate)).toBe(true);
        });

        it('does not offer a disabled rate', () => {
            // Given a rate turned off for the workspace
            const taxRate = createMock<TaxRate>({name: 'VAT', value: '5%', isDisabled: true});

            // When the picker asks
            // Then it is not offered, since a new rule should not start applying it
            expect(isSelectableTaxRate(taxRate)).toBe(false);
        });

        it('does not offer a rate on its way out', () => {
            // Given a rate being deleted
            const taxRate = createMock<TaxRate>({name: 'VAT', value: '5%', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

            // When the picker asks
            // Then it is not offered, because it is about to stop existing
            expect(isSelectableTaxRate(taxRate)).toBe(false);
        });
    });
});
