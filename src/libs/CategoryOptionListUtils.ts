// eslint-disable-next-line you-dont-need-lodash-underscore/get
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {PolicyCategories} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import times from '@src/utils/times';
import {getDecodedCategoryName} from './CategoryUtils';
import type {OptionTree, SectionBase} from './OptionsListUtils';
import tokenizedSearch from './tokenizedSearch';

type CategoryTreeSection = SectionBase & {
    data: OptionTree[];
    indexOffset?: number;
};

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
 * @param [isOneLine] - a flag to determine if text should be one line
 */
function getCategoryOptionTree(options: Record<string, Category> | Category[], isOneLine = false, selectedOptions: Category[] = []): OptionTree[] {
    const optionCollection = new Map<string, OptionTree>();
    for (const option of Object.values(options)) {
        if (isOneLine) {
            if (optionCollection.has(option.name)) {
                continue;
            }

            const decodedCategoryName = getDecodedCategoryName(option.name);
            optionCollection.set(option.name, {
                text: decodedCategoryName,
                keyForList: option.name,
                searchText: option.name,
                tooltipText: decodedCategoryName,
                isDisabled: !option.enabled || option.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                isSelected: !!option.isSelected,
                pendingAction: option.pendingAction,
            });

            continue;
        }

        // eslint-disable-next-line unicorn/no-array-for-each
        option.name.split(CONST.PARENT_CHILD_SEPARATOR).forEach((optionName, index, array) => {
            const indents = times(index, () => CONST.INDENTS).join('');
            const isChild = array.length - 1 === index;
            const searchText = array.slice(0, index + 1).join(CONST.PARENT_CHILD_SEPARATOR);
            const selectedParentOption = !isChild && Object.values(selectedOptions).find((op) => op.name === searchText);
            const isParentOptionDisabled = !selectedParentOption || !selectedParentOption.enabled || selectedParentOption.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (optionCollection.has(searchText)) {
                return;
            }

            const decodedCategoryName = getDecodedCategoryName(optionName);
            optionCollection.set(searchText, {
                text: `${indents}${decodedCategoryName}`,
                keyForList: searchText,
                searchText,
                tooltipText: decodedCategoryName,
                isDisabled: isChild ? !option.enabled || option.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : isParentOptionDisabled,
                isSelected: isChild ? !!option.isSelected : !!selectedParentOption,
                pendingAction: option.pendingAction,
            });
        });
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
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });

        return categorySections;
    }

    if (searchValue) {
        const categoriesForSearch = [...selectedOptionsWithDisabledState, ...enabledCategories];

        const searchCategories: Category[] = tokenizedSearch(categoriesForSearch, searchValue, (category) => [category.name]).map((category) => ({
            ...category,
            isSelected: selectedOptions.some((selectedOption) => selectedOption.name === category.name),
        }));

        const data = getCategoryOptionTree(searchCategories, true);
        categorySections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data,
            indexOffset: data.length,
        });

        return categorySections;
    }

    if (selectedOptions.length > 0) {
        const data = getCategoryOptionTree(selectedOptionsWithDisabledState, true);
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });
    }

    const selectedOptionNames = new Set(selectedOptions.map((selectedOption) => selectedOption.name));
    const filteredCategories = enabledCategories.filter((category) => !selectedOptionNames.has(category.name));

    if (numberOfEnabledCategories < CONST.STANDARD_LIST_ITEM_LIMIT) {
        const data = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
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

        const data = getCategoryOptionTree(cutRecentlyUsedCategories, true);
        categorySections.push({
            // "Recent" section
            title: translate('common.recent'),
            shouldShow: true,
            data,
            indexOffset: data.length,
        });
    }

    const data = getCategoryOptionTree(filteredCategories, false, selectedOptionsWithDisabledState);
    categorySections.push({
        // "All" section when items amount more than the threshold
        title: translate('common.all'),
        shouldShow: true,
        data,
        indexOffset: data.length,
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
        });
    }

    /**
     * A recursive function to convert hierarchy into an array of category objects.
     * The category object contains base 2 properties: "name" and "enabled".
     * It iterates each key one by one. When a category has subcategories, goes deeper into them. Also, sorts subcategories alphabetically.
     */
    const flatHierarchy = (initialHierarchy: Hierarchy) =>
        Object.values(initialHierarchy).reduce((acc: Category[], category) => {
            const {name, pendingAction, ...subcategories} = category;
            if (name) {
                const categoryObject: Category = {
                    name,
                    pendingAction,
                    enabled: categories[name]?.enabled ?? false,
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
