import type {ASTNode, SearchColumnType, SearchGroupBy, SearchQueryToken, SearchStatus, SortOrder} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type RawFilterEntry = {
    operator: string;
    left: string;
    right: string | string[];
    isDefault?: boolean;
    isImplicitKeyword?: boolean;
    isNegated?: boolean;
    raw: string;
};

type DefaultValues = {
    type: SearchDataTypes;
    status: SearchStatus;
    sortBy: SearchColumnType;
    sortOrder: SortOrder;
    groupBy?: SearchGroupBy;
    policyID?: string[];
};

type PostProcessResult = DefaultValues & {
    filters: ASTNode | null;
    tokens: SearchQueryToken[];
};

const DEFAULT_VALUES: DefaultValues = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
};

function toStringValue(value: string | string[]): string {
    if (Array.isArray(value)) {
        return value.at(0) ?? '';
    }
    return value;
}

function toStringArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value.slice() : [value];
}

function sanitizeKeywordValue(value: string | string[]): string[] {
    const values = Array.isArray(value) ? value : [value];
    return values.map((entry) => (typeof entry === 'string' ? entry.replace(/^(['"])(.*)\1$/, '$2') : entry)).filter((entry) => entry !== '');
}

function buildFilterNode(entry: RawFilterEntry): ASTNode {
    const rightValue = Array.isArray(entry.right) ? entry.right.slice() : entry.right;
    return {
        operator: entry.operator as ASTNode['operator'],
        left: entry.left as ASTNode['left'],
        right: rightValue as ASTNode['right'],
    };
}

function buildFilterTree(nodes: ASTNode[]): ASTNode | null {
    if (nodes.length === 0) {
        return null;
    }

    return nodes.slice(1).reduce<ASTNode>(
        (result, node) => ({
            operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
            left: result,
            right: node,
        }),
        nodes[0],
    );
}

function updateDefaultValues(defaults: DefaultValues, entry: RawFilterEntry) {
    const {left, right} = entry;
    if (left === CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS) {
        const statusValue = toStringValue(right);
        const normalized = statusValue.toLowerCase() === 'all' ? CONST.SEARCH.STATUS.EXPENSE.ALL : statusValue;
        defaults.status = normalized as SearchStatus;
        return;
    }

    if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) {
        const values = toStringArray(right).filter((policy) => policy !== '');
        if (values.length > 0) {
            defaults.policyID = values;
        }
        return;
    }

    (defaults as Record<string, unknown>)[left] = toStringValue(right);
}

function buildToken(entry: RawFilterEntry): SearchQueryToken {
    const value = Array.isArray(entry.right) ? entry.right.slice() : entry.right;
    const token: SearchQueryToken = {
        key: entry.left as SearchQueryToken['key'],
        operator: entry.operator as SearchQueryToken['operator'],
        value,
        raw: entry.raw,
    };

    if (entry.isDefault) {
        token.isDefault = true;
    }

    if (entry.isImplicitKeyword) {
        token.isImplicitKeyword = true;
    }

    if (entry.isNegated) {
        token.isNegated = true;
    }

    return token;
}

function postProcess(_query: string, rawFilterList: RawFilterEntry[]): PostProcessResult {
    const defaults: DefaultValues = {...DEFAULT_VALUES};
    const tokens: SearchQueryToken[] = [];
    const filters: ASTNode[] = [];
    const keywordValues: string[] = [];

    rawFilterList.forEach((entry) => {
        tokens.push(buildToken(entry));

        if (entry.isDefault) {
            updateDefaultValues(defaults, entry);
            return;
        }

        if (entry.left === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            keywordValues.push(...sanitizeKeywordValue(entry.right));
            return;
        }

        filters.push(buildFilterNode(entry));
    });

    if (keywordValues.length > 0) {
        filters.push({
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            right: keywordValues,
        });
    }

    return {
        ...defaults,
        filters: buildFilterTree(filters),
        tokens,
    };
}

export type {RawFilterEntry, PostProcessResult};
export {postProcess};
