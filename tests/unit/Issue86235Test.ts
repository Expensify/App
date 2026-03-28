import type {ASTNode, SearchQueryJSON} from '@components/Search/types';
import {parse as parseSearchQuery} from '@libs/SearchParser/searchParser';
import {applyContainsOperatorToTextFields} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';

/**
 * Issue #86235: Multi-word merchants are not searchable using keywords.
 *
 * When searching `merchant:coffee`, the parser produces `operator: "eq"` (exact match),
 * so merchants like "Coffee shop" are not found. The `applyContainsOperatorToTextFields`
 * transformation should convert `eq` → `contains` for text fields (merchant, description)
 * before sending the query to the backend.
 */

function findNode(node: ASTNode, field: string): ASTNode | null {
    if (typeof node.left === 'string' && node.left === field) {
        return node;
    }
    if (typeof node.left === 'object' && node.left) {
        const found = findNode(node.left, field);
        if (found) {
            return found;
        }
    }
    if (typeof node.right === 'object' && !Array.isArray(node.right) && node.right) {
        const found = findNode(node.right, field);
        if (found) {
            return found;
        }
    }
    return null;
}

describe('Issue #86235 - applyContainsOperatorToTextFields', () => {
    it('parser produces eq operator for merchant filter', () => {
        const result = parseSearchQuery('merchant:coffee') as SearchQueryJSON;
        expect(result.filters.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
        expect(result.filters.left).toBe('merchant');
        expect(result.filters.right).toBe('coffee');
    });

    it('transforms merchant eq to contains', () => {
        const result = parseSearchQuery('merchant:coffee') as SearchQueryJSON;
        const transformed = applyContainsOperatorToTextFields(result.filters);
        expect(transformed.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
        expect(transformed.left).toBe('merchant');
        expect(transformed.right).toBe('coffee');
    });

    it('transforms description eq to contains', () => {
        const result = parseSearchQuery('description:lunch') as SearchQueryJSON;
        const transformed = applyContainsOperatorToTextFields(result.filters);
        expect(transformed.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
        expect(transformed.left).toBe('description');
    });

    it('does not transform non-text fields like category', () => {
        const result = parseSearchQuery('category:food') as SearchQueryJSON;
        const transformed = applyContainsOperatorToTextFields(result.filters);
        expect(transformed.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
        expect(transformed.left).toBe('category');
    });

    it('does not transform negated merchant (neq stays neq)', () => {
        const result = parseSearchQuery('-merchant:coffee') as SearchQueryJSON;
        const transformed = applyContainsOperatorToTextFields(result.filters);
        expect(transformed.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO);
        expect(transformed.left).toBe('merchant');
    });

    it('transforms merchant but not category in a compound query', () => {
        const result = parseSearchQuery('amount>100 merchant:coffee category:travel') as SearchQueryJSON;
        const transformed = applyContainsOperatorToTextFields(result.filters);

        const merchantNode = findNode(transformed, 'merchant');
        if (!merchantNode) {
            throw new Error('Expected merchant node to be found in AST');
        }
        expect(merchantNode.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

        const categoryNode = findNode(transformed, 'category');
        if (!categoryNode) {
            throw new Error('Expected category node to be found in AST');
        }
        expect(categoryNode.operator).toBe(CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
    });
});
