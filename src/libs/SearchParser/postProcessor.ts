import type {ASTNode, SearchColumnType, SearchGroupBy, SearchQueryToken, SearchStatus, SortOrder} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type LocationRange = {
    start: number;
    end: number;
};

type RawFilterBase = {
    key: string;
    operator: string;
    value: string | string[];
    location: LocationRange;
};

type RawDefaultFilter = RawFilterBase & {
    type: 'default';
};

type RawStandardFilter = RawFilterBase & {
    type: 'filter';
    isImplicitKeyword?: boolean;
};

type RawFilterEntry = RawDefaultFilter | RawStandardFilter;

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

function buildFilterNode(entry: RawStandardFilter): ASTNode {
    const rightValue = Array.isArray(entry.value) ? entry.value.slice() : entry.value;
    return {
        operator: entry.operator as ASTNode['operator'],
        left: entry.key as ASTNode['left'],
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

function updateDefaultValues(defaults: DefaultValues, entry: RawDefaultFilter) {
    const value = entry.value;
    switch (entry.key) {
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE:
            defaults.type = toStringValue(value) as SearchDataTypes;
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
            const statusValue = toStringValue(value);
            const normalizedStatus = statusValue.toLowerCase() === 'all' ? CONST.SEARCH.STATUS.EXPENSE.ALL : statusValue;
            defaults.status = normalizedStatus as SearchStatus;
            break;
        }
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_BY:
            defaults.sortBy = toStringValue(value) as SearchColumnType;
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.SORT_ORDER:
            defaults.sortOrder = toStringValue(value) as SortOrder;
            break;
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            defaults.groupBy = toStringValue(value) as SearchGroupBy;
            break;
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID: {
            const values = toStringArray(value);
            defaults.policyID = values.length > 0 ? values : defaults.policyID;
            break;
        }
        default:
            break;
    }
}

function buildToken(entry: RawFilterEntry, query: string): SearchQueryToken | null {
    const rawText = query.slice(entry.location.start, entry.location.end).trim();
    if (!rawText) {
        return null;
    }

    const value = Array.isArray(entry.value) ? entry.value.slice() : entry.value;
    const token: SearchQueryToken = {
        key: entry.key as SearchQueryToken['key'],
        operator: entry.operator as SearchQueryToken['operator'],
        value,
        raw: rawText,
    };

    if (entry.type === 'default') {
        token.isDefault = true;
    }

    if (entry.type === 'filter' && entry.isImplicitKeyword) {
        token.isImplicitKeyword = true;
    }

    return token;
}

function postProcess(query: string, entries: RawFilterEntry[]): PostProcessResult {
    const defaults: DefaultValues = {...DEFAULT_VALUES};
    const tokens: SearchQueryToken[] = [];
    const filters: ASTNode[] = [];
    const keywordValues: string[] = [];

    entries.forEach((entry) => {
        const token = buildToken(entry, query);
        if (token) {
            tokens.push(token);
        }

        if (entry.type === 'default') {
            updateDefaultValues(defaults, entry);
            return;
        }

        if (entry.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD) {
            keywordValues.push(...sanitizeKeywordValue(entry.value));
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

export type {RawFilterEntry, RawStandardFilter, RawDefaultFilter, PostProcessResult};
export {postProcess};
