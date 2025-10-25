import type {ASTNode, SearchColumnType, SearchGroupBy, SearchQueryToken, SearchStatus, SortOrder} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type RawFilterEntry = {
    operator: string;
    left: string;
    right: string | string[];
    type: 'default' | 'filter';
    isDefault?: boolean;
    isImplicitKeyword?: boolean;
    isNegated?: boolean;
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

const operatorToSymbol: Record<string, string> = {
    [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO]: ':',
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN]: '>',
    [CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO]: '>=',
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN]: '<',
    [CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO]: '<=',
};

const userFriendlyKeyMap = buildUserFriendlyKeyMap();

function buildUserFriendlyKeyMap() {
    const map = new Map<string, string>();
    const friendlyKeys = CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS as Record<string, string>;

    Object.entries(CONST.SEARCH.SYNTAX_FILTER_KEYS).forEach(([keyName, canonical]) => {
        const friendlyKey = friendlyKeys[keyName];
        if (friendlyKey) {
            map.set(canonical, friendlyKey);
        }
    });

    Object.entries(CONST.SEARCH.SYNTAX_ROOT_KEYS).forEach(([keyName, canonical]) => {
        const friendlyKey = friendlyKeys[keyName];
        if (friendlyKey) {
            map.set(canonical, friendlyKey);
        }
    });

    return map;
}

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
    return values
        .map((entry) => (typeof entry === 'string' ? entry.replace(/^(['"])(.*)\1$/, '$2') : entry))
        .filter((entry) => entry !== '');
}

function needsQuotes(value: string) {
    return value.includes(' ') || value.includes('\xA0');
}

function formatValue(value: string | string[]): string {
    const values = Array.isArray(value) ? value : [value];
    return values.map((entry) => (needsQuotes(entry) ? `"${entry}"` : entry)).join(',');
}

function getUserFriendlyKey(key: string): string {
    return userFriendlyKeyMap.get(key) ?? key;
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
    const value = entry.right;
    switch (entry.left) {
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

function formatTokenRaw(entry: RawFilterEntry): string {
    if (entry.left === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD && entry.isImplicitKeyword) {
        return Array.isArray(entry.right) ? entry.right.join(' ') : String(entry.right);
    }

    const key = getUserFriendlyKey(entry.left);
    const value = formatValue(entry.right);

    if (entry.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO) {
        if (entry.isNegated) {
            return `-${key}:${value}`;
        }
        return `${key}!=${value}`;
    }

    const prefix = entry.isNegated ? '-' : '';
    const operatorSymbol = operatorToSymbol[entry.operator] ?? ':';

    return `${prefix}${key}${operatorSymbol}${value}`;
}

function buildToken(entry: RawFilterEntry): SearchQueryToken {
    const value = Array.isArray(entry.right) ? entry.right.slice() : entry.right;
    const token: SearchQueryToken = {
        key: entry.left as SearchQueryToken['key'],
        operator: entry.operator as SearchQueryToken['operator'],
        value,
        raw: formatTokenRaw(entry),
    };

    if (entry.type === 'default' || entry.isDefault) {
        token.isDefault = true;
    }

    if (entry.isImplicitKeyword) {
        token.isImplicitKeyword = true;
    }

    return token;
}

function postProcess(_query: string, entries: RawFilterEntry[]): PostProcessResult {
    const defaults: DefaultValues = {...DEFAULT_VALUES};
    const tokens: SearchQueryToken[] = [];
    const filters: ASTNode[] = [];
    const keywordValues: string[] = [];

    entries.forEach((entry) => {
        tokens.push(buildToken(entry));

        if (entry.type === 'default') {
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
