import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/**
 * The value a comparison's field is compared against. An array is matched as an OR of its entries.
 */
type RuleFilterValue = string | number | string[];

/**
 * A single comparison node: `<left> <operator> <right>`. Both `left` and `right` are always present.
 */
type RuleFilterComparison = {
    /** The comparison operator. */
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** The field identifier being compared — one of the search-syntax filter keys (`from`, `merchant`, `amount`). */
    left: string;

    /** The literal value being compared against. */
    right: RuleFilterValue;
};

/**
 * A boolean filter that combines two child nodes. `left` / `right` may each be either a leaf comparison
 * or a nested boolean filter. Both children are always present.
 */
type RuleFilter = {
    /** Boolean combinator (`and` / `or`). */
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** Left-hand child: leaf comparison or nested boolean filter. */
    left: RuleFilterComparison | RuleFilter;

    /** Right-hand child: leaf comparison or nested boolean filter. */
    right: RuleFilterComparison | RuleFilter;
};

/** The root of a rule's filter tree: either a single comparison or a boolean combination of nodes. */
type RuleFilterNode = RuleFilter | RuleFilterComparison;

export type {RuleFilter, RuleFilterComparison, RuleFilterNode};
