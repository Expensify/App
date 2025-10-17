import type {ValueOf} from 'type-fest';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import {getDefaultTodoSuggestedSearch} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

const buildMenuItem = (key: ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>): SearchTypeMenuItem => ({
    key,
    translationPath: 'translation.stub' as TranslationPaths,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    icon: {} as IconAsset,
    searchQuery: `${key}-query`,
    searchQueryJSON: undefined,
    hash: 1,
    similarSearchHash: 1,
});

describe('getDefaultTodoSuggestedSearch', () => {
    it('prefers Approve when available', () => {
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'common.todo',
                menuItems: [buildMenuItem(CONST.SEARCH.SEARCH_KEYS.SUBMIT), buildMenuItem(CONST.SEARCH.SEARCH_KEYS.APPROVE)],
            },
        ];

        const result = getDefaultTodoSuggestedSearch(sections);

        expect(result?.key).toBe(CONST.SEARCH.SEARCH_KEYS.APPROVE);
    });

    it('falls back to Submit when Approve is missing', () => {
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'common.todo',
                menuItems: [buildMenuItem(CONST.SEARCH.SEARCH_KEYS.SUBMIT), buildMenuItem(CONST.SEARCH.SEARCH_KEYS.PAY)],
            },
        ];

        const result = getDefaultTodoSuggestedSearch(sections);

        expect(result?.key).toBe(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
    });

    it('returns first item when neither Approve nor Submit exist', () => {
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'common.todo',
                menuItems: [buildMenuItem(CONST.SEARCH.SEARCH_KEYS.PAY)],
            },
        ];

        const result = getDefaultTodoSuggestedSearch(sections);

        expect(result?.key).toBe(CONST.SEARCH.SEARCH_KEYS.PAY);
    });

    it('returns undefined when the todo section is missing', () => {
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'search.savedSearchesMenuItemTitle',
                menuItems: [buildMenuItem(CONST.SEARCH.SEARCH_KEYS.EXPENSES)],
            },
        ];

        const result = getDefaultTodoSuggestedSearch(sections);

        expect(result).toBeUndefined();
    });

    it('returns undefined when the todo section has no items', () => {
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'common.todo',
                menuItems: [],
            },
        ];

        const result = getDefaultTodoSuggestedSearch(sections);

        expect(result).toBeUndefined();
    });
});
