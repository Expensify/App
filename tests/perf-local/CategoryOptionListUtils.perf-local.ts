import {getCategoryListSections, getCategoryOptionTree} from '@libs/CategoryOptionListUtils';
import type {Category} from '@libs/CategoryOptionListUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {PolicyCategories} from '@src/types/onyx';

import {measureFunction} from 'reassure';

import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CATEGORY_COUNTS = [100, 1000, 5000];
const CHILDREN_PER_PARENT = 4;

// Every fifth category is a parent with four "Parent: Child" subcategories, so most rows go through the parent lookup.
function createCategoryList(count: number): Category[] {
    return Array.from({length: count}, (_, index) => {
        const parentIndex = Math.floor(index / (CHILDREN_PER_PARENT + 1));
        const childIndex = index % (CHILDREN_PER_PARENT + 1);
        const name = childIndex === 0 ? `Parent ${parentIndex}` : `Parent ${parentIndex}: Child ${childIndex}`;
        return {name, enabled: true};
    });
}

function createPolicyCategories(count: number): PolicyCategories {
    const categories: PolicyCategories = {};
    for (const {name} of createCategoryList(count)) {
        categories[name] = {
            name,
            enabled: true,
            unencodedName: name,
            areCommentsRequired: false,
            externalID: '',
            origin: '',
            pendingAction: undefined,
        };
    }
    return categories;
}

describe('CategoryOptionListUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    describe('getCategoryOptionTree', () => {
        for (const count of CATEGORY_COUNTS) {
            test(`${count} categories with 10 selected parents`, async () => {
                // Given many nested categories, because the category picker builds this tree on every keystroke
                const categories = createCategoryList(count);
                const selectedOptions = categories.filter((category) => !category.name.includes(CONST.PARENT_CHILD_SEPARATOR)).slice(0, 10);

                // When building the tree
                // Then each parent should be found with a Map lookup instead of a scan of every option
                await measureFunction(() => getCategoryOptionTree(categories, selectedOptions));
            });
        }
    });

    describe('getCategoryListSections', () => {
        for (const count of CATEGORY_COUNTS) {
            test(`${count} categories with a search term`, async () => {
                // Given many categories and a search term that matches most of them, because each keystroke rebuilds the sections
                const categories = createPolicyCategories(count);
                const selectedOptions = createCategoryList(count).slice(0, 10);

                // When building the sections
                // Then the selected names should be checked with a Set instead of a scan per category
                await measureFunction(() =>
                    getCategoryListSections({
                        categories,
                        searchValue: 'Child',
                        selectedOptions,
                        localeCompare,
                        translate: translateLocal,
                    }),
                );
            });

            test(`${count} categories without a search term`, async () => {
                // Given many categories and no search term, because the picker shows the full tree when it opens
                const categories = createPolicyCategories(count);
                const selectedOptions = createCategoryList(count).slice(0, 10);

                // When building the sections
                // Then the selected categories should be found with a Map lookup instead of a scan per selected option
                await measureFunction(() =>
                    getCategoryListSections({
                        categories,
                        selectedOptions,
                        localeCompare,
                        translate: translateLocal,
                    }),
                );
            });
        }
    });
});
