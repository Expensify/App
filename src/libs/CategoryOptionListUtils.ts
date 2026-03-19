// eslint-disable-next-line you-dont-need-lodash-underscore/get
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {PolicyCategories} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import times from '@src/utils/times';
import {getDecodedCategoryName} from './CategoryUtils';
import type {OptionTree} from './OptionsListUtils';
import tokenizedSearch from './tokenizedSearch';

type CategoryTreeSection = Section<OptionTree>;

type Category = {
    name: string;
    enabled: boolean;
    isSelected?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
};

type Hierarchy = Record<string, Category & {[key: string]: Hierarchy & Category}>;

/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param options - an initial object array
 * @param options[].enabled - a flag to enable/disable option in a list
 * @param options[].name - a name of an option
 */
function getCategoryOptionTree(options: Record<string, Category> | Category[], selectedOptions: Category[] = []): OptionTree[] {
    const optionCollection = new Map<string, OptionTree>();
    for (const option of Object.values(options)) {
        const array = option.name.split(CONST.PARENT_CHILD_SEPARATOR);

        for (let index = 0; index < array.length; index++) {
            const optionName = array.at(index);
            if (!optionName) {
                continue;
            }

            const indents = times(index, () => CONST.INDENTS).join('');
            const isChild = array.length - 1 === index;
            const searchText = array.slice(0, index + 1).join(CONST.PARENT_CHILD_SEPARATOR);
            const selectedParentOption = !isChild && Object.values(selectedOptions).find((op) => op.name === searchText);
            const optionParent = !isChild && Object.values(options).find((op) => op.name === searchText);
            const parentOption = selectedParentOption ?? optionParent;

            const isParentOptionDisabled = !parentOption || !parentOption.enabled || parentOption.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (optionCollection.has(searchText)) {
                continue;
            }
            const leafName = getDecodedCategoryName(optionName.trim());
            const decodedCategoryName = getDecodedCategoryName(option.name);
            const tooltipText = isChild ? decodedCategoryName : getDecodedCategoryName(searchText);
            optionCollection.set(searchText, {
                text: `${indents}${leafName}`,
                keyForList: searchText,
                searchText,
                tooltipText,
                isDisabled: isChild ? !option.enabled || option.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : isParentOptionDisabled,
                isSelected: isChild ? !!option.isSelected : !!selectedParentOption,
                pendingAction: option.pendingAction,
            });
        }
    }

    return Array.from(optionCollection.values());
}

/**
 * Builds the section list for categories
 */
function getCategoryListSections({
    categories,
    localeCompare,
    searchValue,
    selectedOptions = [],
    recentlyUsedCategories = [],
    maxRecentReportsToShow = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
    translate,
}: {
    categories: PolicyCategories;
    localeCompare: LocaleContextProps['localeCompare'];
    selectedOptions?: Category[];
    searchValue?: string;
    recentlyUsedCategories?: string[];
    maxRecentReportsToShow?: number;
    translate: LocalizedTranslate;
}): CategoryTreeSection[] {
    const sortedCategories = sortCategories(categories, localeCompare);
    const enabledCategories = Object.values(sortedCategories).filter((category) => category.enabled);
    const enabledCategoriesNames = new Set(enabledCategories.map((category) => category.name));
    const selectedOptionsWithDisabledState: Category[] = [];
    const categorySections: CategoryTreeSection[] = [];
    const numberOfEnabledCategories = enabledCategories.length;

    for (const option of selectedOptions) {
        if (enabledCategoriesNames.has(option.name)) {
            const categoryObj = enabledCategories.find((category) => category.name === option.name);
            selectedOptionsWithDisabledState.push({...(categoryObj ?? option), isSelected: true, enabled: true});
            continue;
        }
        selectedOptionsWithDisabledState.push({...option, isSelected: true, enabled: false});
    }

    if (numberOfEnabledCategories === 0 && selectedOptions.length > 0) {
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState);
        categorySections.push({
            // "Selected" section
            title: '',
            data,
            sectionIndex: 0,
        });

        return categorySections;
    }

    if (searchValue) {
        // Step 1: Combine selected and enabled categories for searching
        const categoriesForSearch = [...selectedOptionsWithDisabledState, ...enabledCategories];

        // Step 2: Get search results using tokenizedSearch
        let searchCategories: Category[] = tokenizedSearch(categoriesForSearch, searchValue, (category) => [category.name]).map((category) => ({
            ...category,
            // Temporarily store if it was selected
            wasSelected: selectedOptions.some((selectedOption) => selectedOption.name === category.name),
        }));

        // Step 3: Deduplicate by name (keep first occurrence, which is likely the selected one if present)
        const seen = new Set<string>();
        searchCategories = searchCategories.filter((category) => {
            if (seen.has(category.name)) {
                return false;
            }
            seen.add(category.name);
            return true;
        });

        // Step 4: Re-sort to restore hierarchical grouping
        // Convert back to Record format expected by sortCategories
        const categoriesRecord: Record<string, Category> = {};
        searchCategories.forEach((category) => {
            categoriesRecord[category.name] = category;
        });
        const sortedCategories = sortCategories(categoriesRecord, localeCompare);

        // Step 5: Re-apply the isSelected flag (lost during sortCategories)
        const finalSearchCategories: Category[] = sortedCategories.map((category) => ({
            ...category,
            isSelected: selectedOptions.some((selectedOption) => selectedOption.name === category.name),
        }));

        // Step 6: Generate the option tree and push the section
        const data = getCategoryOptionTree(finalSearchCategories);
        categorySections.push({
            // "Search" section
            title: '',
            data,
            sectionIndex: 0,
        });

        return categorySections;
    }

    if (selectedOptions.length > 0) {
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState);
        categorySections.push({
            // "Selected" section
            title: '',
            data,
            sectionIndex: 1,
        });
    }

    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.name));
    const filteredCategories = enabledCategories.filter((category) => !selectedOptionNames.has(category.name));

    if (numberOfEnabledCategories < CONST.STANDARD_LIST_ITEM_LIMIT) {
        const data = getCategoryOptionTree(filteredCategories, selectedOptionsWithDisabledState);
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            data,
            sectionIndex: 2,
        });

        return categorySections;
    }

    const filteredRecentlyUsedCategories = recentlyUsedCategories
        .filter(
            (categoryName) =>
                !selectedOptionNames.has(categoryName) && categories[categoryName]?.enabled && categories[categoryName]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        )
        .map((categoryName) => ({
            name: categoryName,
            enabled: categories[categoryName].enabled ?? false,
        }));

    if (filteredRecentlyUsedCategories.length > 0) {
        const cutRecentlyUsedCategories = filteredRecentlyUsedCategories.slice(0, maxRecentReportsToShow);

        const data = getCategoryOptionTree(cutRecentlyUsedCategories);
        categorySections.push({
            // "Recent" section
            title: translate('common.recent'),
            data,
            sectionIndex: 3,
        });
    }

    const data = getCategoryOptionTree(filteredCategories, selectedOptionsWithDisabledState);
    categorySections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        data,
        sectionIndex: 4,
    });

    return categorySections;
}

/**
 * Sorts categories using a simple object.
 * It builds an hierarchy (based on an object), where each category has a name and other keys as subcategories.
 * Via the hierarchy we avoid duplicating and sort categories one by one. Subcategories are being sorted alphabetically.
 */
function sortCategories(categories: Record<string, Category>, localeCompare: LocaleContextProps['localeCompare']): Category[] {
    // Sorts categories alphabetically by name.
    const sortedCategories = Object.values(categories).sort((a, b) => localeCompare(a.name, b.name));

    // An object that respects nesting of categories. Also, can contain only uniq categories.
    const hierarchy: Hierarchy = {};
    /**
     * Iterates over all categories to set each category in a proper place in hierarchy
     * It gets a path based on a category name e.g. "Parent: Child: Subcategory" -> "Parent.Child.Subcategory".
     * {
     *   Parent: {
     *     name: "Parent",
     *     Child: {
     *       name: "Child"
     *       Subcategory: {
     *         name: "Subcategory"
     *       }
     *     }
     *   }
     * }
     */
    for (const category of sortedCategories) {
        const path = category.name.split(CONST.PARENT_CHILD_SEPARATOR);
        const existedValue = lodashGet(hierarchy, path, {}) as Hierarchy;
        lodashSet(hierarchy, path, {
            ...existedValue,
            name: category.name,
            pendingAction: category.pendingAction,
            enabled: category.enabled ?? false,
        });
    }

    /**
     * A recursive function to convert hierarchy into an array of category objects.
     * The category object contains base 2 properties: "name" and "enabled".
     * It iterates each key one by one. When a category has subcategories, goes deeper into them. Also, sorts subcategories alphabetically.
     */
    const flatHierarchy = (initialHierarchy: Hierarchy) =>
        Object.values(initialHierarchy).reduce((acc: Category[], category) => {
            const {name, pendingAction, enabled, ...subcategories} = category;
            if (name) {
                const categoryObject: Category = {
                    name,
                    pendingAction,
                    enabled: enabled ?? false,
                };

                acc.push(categoryObject);
            }

            if (!isEmptyObject(subcategories)) {
                const nestedCategories = flatHierarchy(subcategories);

                acc.push(...nestedCategories.sort((a, b) => localeCompare(a.name, b.name)));
            }

            return acc;
        }, []);

    return flatHierarchy(hierarchy);
}

export {getCategoryListSections, getCategoryOptionTree, sortCategories};

export type {Category, CategoryTreeSection};
