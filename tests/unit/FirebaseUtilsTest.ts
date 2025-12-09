import {expect} from '@jest/globals';
import type {FirebaseAttributes, PerfAttributes} from '@libs/Firebase/types';
import utils from '@libs/Firebase/utils';

describe('getAttributes', () => {
    const allAttributes: Array<keyof PerfAttributes> = [
        'accountId',
        'personalDetailsLength',
        'reportActionsLength',
        'reportsLength',
        'policiesLength',
        'transactionsLength',
        'transactionViolationsLength',
    ];

    const checkAttributes = (attributes: Partial<PerfAttributes>, expectedAttributes: Array<keyof Partial<PerfAttributes>>) => {
        for (const attr of expectedAttributes) {
            expect(attributes).toHaveProperty(attr);
        }
        expect(Object.keys(attributes).length).toEqual(expectedAttributes.length);
    };

    it('should return 5 specific attributes', () => {
        const requestedAttributes: Array<keyof FirebaseAttributes> = ['accountId', 'personalDetailsLength', 'reportActionsLength', 'reportsLength', 'policiesLength'];
        const attributes = utils.getAttributes(requestedAttributes);
        checkAttributes(attributes, requestedAttributes);
    });

    it('should return all attributes when no array is passed', () => {
        const attributes = utils.getAttributes();
        checkAttributes(attributes, allAttributes);
    });

    it('should return all attributes when an empty array is passed', () => {
        const attributes = utils.getAttributes([]);
        checkAttributes(attributes, allAttributes);
    });
});
