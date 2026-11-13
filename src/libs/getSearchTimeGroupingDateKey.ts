/** Keeps Search and Insights time buckets tied to the same positive date filter. */
import type {ASTNode, SearchDateFilterKeys, SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import {DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';

const GROUPING_DATE_KEYS = [
    CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_SUBMISSION,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL,
] as const;

function getDateKeyFromNode(node: ASTNode | string | string[] | null | undefined): SearchDateFilterKeys | undefined {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
        return undefined;
    }
    const {operator, left, right} = node;
    if (operator === CONST.SEARCH.SYNTAX_OPERATORS.AND || operator === CONST.SEARCH.SYNTAX_OPERATORS.OR) {
        const leftKey = getDateKeyFromNode(left);
        const rightKey = getDateKeyFromNode(right);
        if (leftKey === rightKey) {
            return leftKey;
        }
        if (operator === CONST.SEARCH.SYNTAX_OPERATORS.AND) {
            if (!leftKey) {
                return rightKey;
            }
            if (!rightKey) {
                return leftKey;
            }
        }
        return CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;
    }
    if (operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO || operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_CONTAINS || !DATE_FILTER_KEYS.some((key) => key === left)) {
        return undefined;
    }
    if (right === CONST.SEARCH.DATE_PRESETS.NEVER || (Array.isArray(right) && right.includes(CONST.SEARCH.DATE_PRESETS.NEVER))) {
        return undefined;
    }
    return GROUPING_DATE_KEYS.find((key) => key === left) ?? CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;
}

function getSearchTimeGroupingDateKey(query: Pick<SearchQueryJSON, 'filters' | 'type'> | undefined): SearchDateFilterKeys {
    if (query?.type !== CONST.SEARCH.DATA_TYPES.EXPENSE) {
        return CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;
    }
    return getDateKeyFromNode(query?.filters) ?? CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;
}

export default getSearchTimeGroupingDateKey;
