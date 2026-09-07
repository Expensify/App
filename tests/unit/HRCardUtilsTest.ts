import {getHRCards} from '@pages/workspace/hr/utils';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';

import createMock from '../utils/createMock';

describe('HR card descriptors', () => {
    it('exposes each Merge provider slug without changing the static providers', () => {
        const cards = getHRCards(
            createMock<Parameters<typeof getHRCards>[0]>({
                policyID: '1',
                translate: jest.fn(() => ''),
                getLocalDateFromDatetime: jest.fn(() => new Date()),
            }),
        );
        const mergeCards = cards.filter((card) => card.connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);

        expect(mergeCards.map((card) => card.mergeSlug)).toEqual(Object.keys(MERGE_HR_PROVIDERS));
        expect(cards.filter((card) => card.connectionName !== CONST.POLICY.CONNECTIONS.NAME.MERGE_HR).every((card) => card.mergeSlug === undefined)).toBe(true);
    });
});
