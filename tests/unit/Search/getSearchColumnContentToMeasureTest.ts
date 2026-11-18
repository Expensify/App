import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import getSearchColumnContentToMeasure from '@libs/getSearchColumnContentToMeasure';
import type {SearchColumnMeasurementContext} from '@libs/getSearchColumnContentToMeasure';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import createRandomPolicy from '../../utils/collections/policies';
import {buildTransactionRow} from '../../utils/collections/searchListItems';
import {translateLocal} from '../../utils/TestHelper';

const FALLBACK_POLICY_ID = 'fallbackPolicy';
const OTHER_POLICY_ID = '2';

const context: SearchColumnMeasurementContext = {
    fallbackPolicyID: FALLBACK_POLICY_ID,
    policyCategories: {
        [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${FALLBACK_POLICY_ID}`]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Food: {name: 'Food', enabled: true, 'GL Code': 'FALLBACK-CAT'},
        },
        [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${OTHER_POLICY_ID}`]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Food: {name: 'Food', enabled: true, 'GL Code': 'OTHER-CAT'},
        },
    },
    policyTags: {
        [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${FALLBACK_POLICY_ID}`]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Sales: {name: 'Sales', enabled: true, 'GL Code': 'FALLBACK-TAG'},
                },
            },
        },
        [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${OTHER_POLICY_ID}`]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Sales: {name: 'Sales', enabled: true, 'GL Code': 'OTHER-TAG'},
                },
            },
        },
    },
};

function buildTransactionItem(overrides: Partial<TransactionListItemType> = {}): TransactionListItemType {
    return buildTransactionRow(1, '1', {
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        category: 'Food',
        tag: 'Sales',
        ...overrides,
    });
}

describe('getSearchColumnContentToMeasure', () => {
    describe('Category GL code', () => {
        it('measures an unreported row with no report or policy against the fallback policy', () => {
            // Given an unreported row that carries neither a report nor a policy
            const item = buildTransactionItem();

            // When the Category GL code column is measured with a fallback policy in the context
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE, item, translateLocal, context);

            // Then the GL code comes from the fallback policy's categories
            expect(result).toEqual([{text: 'FALLBACK-CAT'}]);
        });

        it('measures an unreported row against its own policy when it has one', () => {
            // Given an unreported row that carries its own policy
            const item = buildTransactionItem({
                policy: createRandomPolicy(Number(OTHER_POLICY_ID)),
            });

            // When the Category GL code column is measured
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE, item, translateLocal, context);

            // Then the row's own policy wins over the fallback
            expect(result).toEqual([{text: 'OTHER-CAT'}]);
        });

        it('measures a reported row with no report or policy as empty instead of using the fallback policy', () => {
            // Given a reported row that carries neither a report nor a policy
            const item = buildTransactionItem({reportID: '123'});

            // When the Category GL code column is measured
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE, item, translateLocal, context);

            // Then the fallback policy is not used, since it only applies to unreported expenses
            expect(result).toEqual([{text: ''}]);
        });

        it('measures an unreported row as empty when no fallback policy is provided', () => {
            // Given an unreported row with no report or policy
            const item = buildTransactionItem();

            // When the column is measured with a context that has no fallback policy
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE, item, translateLocal, {...context, fallbackPolicyID: undefined});

            // Then there is no policy to read a GL code from
            expect(result).toEqual([{text: ''}]);
        });
    });

    describe('Tag GL code', () => {
        it('measures an unreported row with no report or policy against the fallback policy', () => {
            // Given an unreported row that carries neither a report nor a policy
            const item = buildTransactionItem();

            // When the Tag GL code column is measured with a fallback policy in the context
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE, item, translateLocal, context);

            // Then the GL code comes from the fallback policy's tag lists
            expect(result).toEqual([{text: 'FALLBACK-TAG'}]);
        });

        it('measures an unreported row against its own policy when it has one', () => {
            // Given an unreported row that carries its own policy
            const item = buildTransactionItem({
                policy: createRandomPolicy(Number(OTHER_POLICY_ID)),
            });

            // When the Tag GL code column is measured
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE, item, translateLocal, context);

            // Then the row's own policy wins over the fallback
            expect(result).toEqual([{text: 'OTHER-TAG'}]);
        });

        it('measures a reported row with no report or policy as empty instead of using the fallback policy', () => {
            // Given a reported row that carries neither a report nor a policy
            const item = buildTransactionItem({reportID: '123'});

            // When the Tag GL code column is measured
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE, item, translateLocal, context);

            // Then the fallback policy is not used, since it only applies to unreported expenses
            expect(result).toEqual([{text: ''}]);
        });

        it('measures an unreported row as empty when no fallback policy is provided', () => {
            // Given an unreported row with no report or policy
            const item = buildTransactionItem();

            // When the column is measured with a context that has no fallback policy
            const result = getSearchColumnContentToMeasure(CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE, item, translateLocal, {...context, fallbackPolicyID: undefined});

            // Then there is no policy to read a GL code from
            expect(result).toEqual([{text: ''}]);
        });
    });
});
