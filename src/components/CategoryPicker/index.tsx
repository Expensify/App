import Icon from '@components/Icon';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getCategoryListSections} from '@libs/CategoryOptionListUtils';
import type {Category, CategoryTreeSection} from '@libs/CategoryOptionListUtils';
import {canCreateCategoryFromSearch, getEnabledCategoriesCount, getUnavailableCategories, getVisibleCategories} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getHeaderMessageForNonUserList, getNoneOption} from '@libs/OptionsListUtils';
import type {OptionTree} from '@libs/OptionsListUtils/types';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {cancelSpan, endSpanWithAttributes} from '@libs/telemetry/activeSpans';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import React, {useEffect, useEffectEvent} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- Need original useOnyx to avoid reading partial Search snapshot policy data (GL code flags are trimmed from the snapshot).
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type CategoryPickerProps = {
    policyID: string | undefined;
    selectedCategory?: string;
    onSubmit: (item: ListItem) => void;

    /**
     * Receives the sanitized search text when the user taps the create row. The row is offered only when this is passed,
     * the search has no results, and the text can be a category name (or names a disabled category).
     */
    onCreateCategory?: (categoryName: string) => void;

    shouldShowNoneOption?: boolean;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;

    /** Whether the search input should auto-focus when the picker mounts. Only opted into by the inline-edit popover wrapper. */
    shouldAutoFocusSearchInput?: boolean;

    /**
     * Whether to show GL codes regardless of the workspace setting. When false, CategoryPicker reads
     * `showCategoryGLCodes && glCodes` from the policy in Onyx.
     */
    shouldAlwaysShowGLCode?: boolean;

    /** Number of enabled categories at which the search input appears. Defaults to `CONST.STANDARD_LIST_ITEM_LIMIT`. */
    searchInputThreshold?: number;

    /**
     * The account the expense belongs to, passed only when the current user owns it. The list is then limited to the
     * categories they can use. Left out when someone else owns the expense, such as an admin recoding it, so the full
     * list shows.
     */
    ownerAccountID?: number;

    /**
     * The expense owner when someone else recodes it. Categories are grouped by whether the owner can use them.
     */
    submitterAccountID?: number;
};

/**
 * Titles a group of sections built by getCategoryListSections: the first section with rows gets the group's title,
 * since a section's title only shows when it has rows. Offsetting the indexes keeps the header keys unique across groups.
 */
/** Larger than any sectionIndex getCategoryListSections returns, so offset groups never share a header key */
const SECTION_INDEX_OFFSET = 10;

const titleSectionGroup = (sections: CategoryTreeSection[], title: string, sectionIndexOffset: number): CategoryTreeSection[] => {
    const titledSectionIndex = sections.findIndex((section) => section.data.length > 0);
    return sections.map((section, index) => ({...section, title: index === titledSectionIndex ? title : '', sectionIndex: (section.sectionIndex ?? 0) + sectionIndexOffset}));
};

const getSelectedOptions = (selectedCategory?: string): Category[] => {
    if (!selectedCategory) {
        return [];
    }

    return [
        {
            name: selectedCategory,
            isSelected: true,
            enabled: true,
        },
    ];
};

type CategoryPickerOptionsProps = Pick<
    CategoryPickerProps,
    'selectedCategory' | 'policyID' | 'shouldShowNoneOption' | 'shouldAlwaysShowGLCode' | 'searchInputThreshold' | 'ownerAccountID' | 'submitterAccountID'
>;

function useCategoryPickerData(policyID: string | undefined, submitterAccountID?: number) {
    const [shouldShowGLCodeFromPolicy] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {
        selector: (policy) => !!policy?.showCategoryGLCodes && !!policy?.glCodes,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const [submitterPersonalDetails] = usePersonalDetailsByIDs([submitterAccountID]);
    return {policyCategories, policyCategoriesDraft, policyRecentlyUsedCategories, shouldShowGLCodeFromPolicy, translate, localeCompare, formatPhoneNumber, submitterPersonalDetails};
}

function getCategoryPickerOptions(
    {
        policyCategories,
        policyCategoriesDraft,
        policyRecentlyUsedCategories,
        shouldShowGLCodeFromPolicy,
        translate,
        localeCompare,
        formatPhoneNumber,
        submitterPersonalDetails,
    }: ReturnType<typeof useCategoryPickerData>,
    {
        selectedCategory,
        shouldShowNoneOption = false,
        shouldAlwaysShowGLCode = false,
        searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
        ownerAccountID,
        submitterAccountID,
    }: Omit<CategoryPickerOptionsProps, 'policyID'>,
) {
    const shouldShowGLCode = shouldAlwaysShowGLCode || !!shouldShowGLCodeFromPolicy;
    const allCategories = policyCategories ?? policyCategoriesDraft ?? {};

    const selectedOptions = getSelectedOptions(selectedCategory);
    const categories = ownerAccountID === undefined ? allCategories : getVisibleCategories(allCategories, ownerAccountID);
    const validPolicyRecentlyUsedCategories = policyRecentlyUsedCategories?.filter?.((p) => !isEmptyObject(p));
    const unavailableCategories = submitterAccountID === undefined ? {} : getUnavailableCategories(allCategories, submitterAccountID);
    const getSectionsForQuery = (searchValue: string): CategoryTreeSection[] => {
        if (submitterAccountID === undefined || isEmptyObject(unavailableCategories)) {
            return getCategoryListSections({
                searchValue,
                selectedOptions,
                categories,
                localeCompare,
                recentlyUsedCategories: validPolicyRecentlyUsedCategories,
                translate,
                shouldShowGLCode,
                searchInputThreshold,
            });
        }

        const submitterName = getDisplayNameForParticipant({
            accountID: submitterAccountID,
            personalDetailsData: submitterPersonalDetails,
            formatPhoneNumber,
            hiddenTranslation: translate('common.hidden'),
        });
        // Keep the selected category above the groups without repeating it in either group.
        const selectedPolicyCategory = selectedCategory ? allCategories[selectedCategory] : undefined;
        const withoutSelectedCategory = (groupCategories: PolicyCategories): PolicyCategories =>
            Object.fromEntries(Object.entries(groupCategories).filter(([categoryName]) => categoryName !== selectedCategory));
        // Suppress Recent and All within each group, so the availability headings are the only headings.
        const buildGroupSections = (groupCategories: PolicyCategories, groupSelectedOptions: Category[]) =>
            getCategoryListSections({
                searchValue,
                selectedOptions: groupSelectedOptions,
                categories: groupCategories,
                localeCompare,
                translate,
                shouldShowGLCode,
                searchInputThreshold: Number.POSITIVE_INFINITY,
            });
        const selectedSections = buildGroupSections(selectedCategory && selectedPolicyCategory ? {[selectedCategory]: selectedPolicyCategory} : {}, selectedOptions);
        const availableSections = buildGroupSections(withoutSelectedCategory(getVisibleCategories(allCategories, submitterAccountID)), []);
        const unavailableSections = buildGroupSections(withoutSelectedCategory(unavailableCategories), []);
        return [
            ...selectedSections.map((section) => ({...section, title: ''})),
            ...titleSectionGroup(availableSections, translate('workspace.categories.availableToMember', submitterName), SECTION_INDEX_OFFSET),
            ...titleSectionGroup(unavailableSections, translate('workspace.categories.notAvailableToMember', submitterName), SECTION_INDEX_OFFSET * 2),
        ];
    };
    const getSections = (searchValue: string) => {
        const sections = getSectionsForQuery(searchValue);

        const noneOption: OptionTree[] = shouldShowNoneOption
            ? getNoneOption(searchValue, !selectedCategory, translate).map((option): OptionTree => ({
                  text: option.text,
                  keyForList: option.keyForList,
                  searchText: '',
                  tooltipText: option.text,
                  isDisabled: false,
                  isSelected: option.isSelected,
              }))
            : [];
        if (noneOption.length === 0) {
            return sections;
        }
        const noneOptionSection = {title: '', data: noneOption, sectionIndex: -1};
        const selectedCategorySectionIndex = sections.findIndex((section) => section.data.some((category) => category.searchText === selectedCategory));
        return [...sections.slice(0, selectedCategorySectionIndex + 1), noneOptionSection, ...sections.slice(selectedCategorySectionIndex + 1)];
    };

    const categoriesCount = getEnabledCategoriesCount(categories);
    return {
        allCategories,
        hasDraftCategories: policyCategoriesDraft !== undefined,
        shouldShowTextInput: categoriesCount >= searchInputThreshold,
        // Drafts can show search in the list, but the sheet's search space and keyboard handling use saved categories.
        hasSearchablePolicyCategories: (policyCategories ? categoriesCount : 0) >= searchInputThreshold,
        getSections,
    };
}

function useCategoryPickerOptions({policyID, ...options}: CategoryPickerOptionsProps) {
    const data = useCategoryPickerData(policyID, options.submitterAccountID);
    return getCategoryPickerOptions(data, options);
}

type CategoryPickerListProps = Pick<
    CategoryPickerProps,
    'policyID' | 'selectedCategory' | 'onSubmit' | 'onCreateCategory' | 'addBottomSafeAreaPadding' | 'shouldAutoFocusSearchInput' | 'ownerAccountID'
> & {
    options: ReturnType<typeof getCategoryPickerOptions>;
    /** Sections for the debounced query, so the create row uses the same query as the displayed results. */
    sections: ReturnType<ReturnType<typeof getCategoryPickerOptions>['getSections']>;
    searchValue: string;
    debouncedSearchValue: string;
    setSearchValue: (value: string) => void;
};

function useCategoryPickerListProps({
    selectedCategory,
    policyID,
    onSubmit,
    onCreateCategory,
    addBottomSafeAreaPadding = false,
    shouldAutoFocusSearchInput = false,
    ownerAccountID,
    options,
    sections,
    searchValue,
    debouncedSearchValue,
    setSearchValue,
}: CategoryPickerListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {inputCallbackRef} = useAutoFocusInput();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const offlineMessage = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const sectionsWithTitleStyles = sections.map((section) => ({
        ...section,
        data: section.data.map((category) => ({
            ...category,
            titleStyles: styles.w100,
        })),
    }));
    const categoryData = sections.flatMap((section) => section.data);
    const selectedOptionKey = categoryData.find((category) => category.searchText === selectedCategory)?.keyForList;

    // Backfill the policy's categories when the list mounts so it doesn't get stuck showing only the selected category.
    const {isLoadingPolicyCategories} = useLoadPolicyCategories(policyID);
    // While the on-demand fetch above is in flight, show the list skeleton instead of flashing the selected-only
    // fallback. A draft collection is a complete local list, so it renders immediately rather than waiting on the read.
    const isLoadingNewOptions = isLoadingPolicyCategories && !options.hasDraftCategories;

    // An effect event, so the owner is read when the list renders without making it a dependency: only the list
    // rendering ends the span. Once ended, the span is gone, so later renders don't touch it.
    const endOpenCategoryPickerSpan = useEffectEvent(() => {
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER, {
            [CONST.TELEMETRY.ATTRIBUTE_IS_FILTERED]: ownerAccountID !== undefined,
        });
    });

    useEffect(() => {
        if (isLoadingNewOptions) {
            return;
        }
        endOpenCategoryPickerSpan();
    }, [isLoadingNewOptions]);

    // A no-op once the span has ended, so this only cancels it when the picker closes before its list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER), []);

    const createCategoryName = StringUtils.sanitizeName(debouncedSearchValue);
    const shouldShowCreateCategoryRow = !!onCreateCategory && !isLoadingNewOptions && categoryData.length === 0 && canCreateCategoryFromSearch(options.allCategories, createCategoryName);

    // The create row has to be a list item: an empty list renders its empty state instead of the list, and a row can take keyboard focus.
    const buildCreateCategorySection = () => {
        const createCategoryRowText = translate('workspace.categories.createCategoryFromSearch', createCategoryName);
        return {
            title: '',
            data: [
                {
                    text: createCategoryRowText,
                    keyForList: createCategoryName,
                    searchText: createCategoryName,
                    tooltipText: createCategoryRowText,
                    isDisabled: false,
                    isSelected: false,
                    shouldHideSelectionButton: true,
                    titleStyles: styles.w100,
                    leftElement: (
                        <View style={[styles.mr3, styles.justifyContentCenter]}>
                            <Icon
                                src={icons.Plus}
                                fill={theme.icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    ),
                },
            ],
            sectionIndex: sections.length,
        };
    };
    const visibleSections = shouldShowCreateCategoryRow ? [...sectionsWithTitleStyles, buildCreateCategorySection()] : sectionsWithTitleStyles;

    const selectCategory = (item: ListItem) => {
        // The create row only shows when nothing matched, so whenever it is shown it is the only row that can be tapped.
        if (shouldShowCreateCategoryRow) {
            onCreateCategory(createCategoryName);
            return;
        }
        onSubmit(item);
    };

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList(translate, categoryData.length > 0, debouncedSearchValue),
        hint: offlineMessage,
        style: {headerMessageStyle: shouldShowCreateCategoryRow ? styles.pb2 : undefined},
        // Auto-focus is opt-in (inline-edit popover only) and skipped on touch surfaces to avoid popping the keyboard.
        disableAutoFocus: !(shouldAutoFocusSearchInput && canFocusInputOnScreenFocus()),
        ref: inputCallbackRef as (ref: BaseTextInputRef | null) => void,
    };

    return {
        // The list only renders the skeleton when it has no items, so the sections have to be emptied too.
        // Otherwise the selected-only fallback row still shows while the fetch is in flight.
        sections: isLoadingNewOptions ? getEmptyArray<never>() : visibleSections,
        onSelectRow: selectCategory,
        ListItem: SingleSelectListItem,
        shouldShowTextInput: options.shouldShowTextInput,
        textInputOptions,
        shouldShowLoadingPlaceholder: isLoadingNewOptions,
        isLoadingNewOptions,
        initiallyFocusedItemKey: selectedOptionKey,
        addBottomSafeAreaPadding,
        titleNumberOfLines: CONST.TRANSACTION_TAG_AND_CATEGORY_PICKER_MAX_TITLE_LINES,
    };
}

function CategoryPickerList(props: CategoryPickerListProps) {
    const listProps = useCategoryPickerListProps(props);
    return <SelectionListWithSections {...listProps} />;
}

function CategoryPicker({
    policyID,
    selectedCategory,
    ownerAccountID,
    submitterAccountID,
    shouldShowNoneOption,
    shouldAlwaysShowGLCode,
    searchInputThreshold,
    ...pickerProps
}: CategoryPickerProps) {
    const options = useCategoryPickerOptions({policyID, selectedCategory, ownerAccountID, submitterAccountID, shouldShowNoneOption, shouldAlwaysShowGLCode, searchInputThreshold});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const sections = options.getSections(debouncedSearchValue);
    const listProps = useCategoryPickerListProps({...pickerProps, policyID, selectedCategory, ownerAccountID, options, sections, searchValue, debouncedSearchValue, setSearchValue});
    return <SelectionListWithSections {...listProps} />;
}

export default CategoryPicker;
export {CategoryPickerList, getCategoryPickerOptions, useCategoryPickerData};
export type {CategoryPickerProps};
