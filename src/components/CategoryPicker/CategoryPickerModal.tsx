import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import Tooltip from '@components/Tooltip';

import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import usePickerPopoverRowCount from '@hooks/usePickerPopoverRowCount';
import usePickerPopoverSession from '@hooks/usePickerPopoverSession';
import useTheme from '@hooks/useTheme';

import startOpenCategoryPickerSpan from '@libs/telemetry/startOpenCategoryPickerSpan';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {WithSentryLabelWhenPressable} from '@src/types/utils/SentryLabel';

import React, {useLayoutEffect} from 'react';

import {CategoryPickerList, getCategoryPickerOptions, useCategoryPickerData} from '.';

type CategoryPickerModalProps = WithSentryLabelWhenPressable<'onAddCategory', 'addCategorySentryLabel'> & {
    /** The policy whose categories should be shown */
    policyID: string | undefined;

    selectedCategory?: string;

    /** Whether to show GL codes under each category regardless of the workspace setting */
    shouldAlwaysShowGLCode?: boolean;

    /** Number of enabled categories at which the search input appears. The content height estimate uses the same value. */
    searchInputThreshold?: number;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Shows a header with a back button and an add button, for users who can add a category to the workspace */
    onAddCategory?: () => void;

    /** Receives the searched-for name when the user taps the create row. The row is offered only when this is passed. */
    onCreateCategory?: (categoryName: string) => void;

    /** The account the expense belongs to, passed only when the current user owns it, so the list shows just the categories they can use */
    ownerAccountID?: number;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'children'>;

function CategoryPickerModal({
    policyID,
    selectedCategory,
    shouldAlwaysShowGLCode = false,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    onSelected,
    onAddCategory,
    addCategorySentryLabel,
    onCreateCategory,
    ownerAccountID,
    isVisible,
    onClose,
    onModalHide,
    shouldShowHeader = false,
    ...popoverProps
}: CategoryPickerModalProps) {
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const {searchKey, shouldPrepareOptions, finishClosing} = usePickerPopoverSession(isVisible, onModalHide);
    const data = useCategoryPickerData(policyID);
    const {translate} = data;
    const options = shouldPrepareOptions ? getCategoryPickerOptions(data, {selectedCategory, shouldAlwaysShowGLCode, searchInputThreshold, ownerAccountID}) : undefined;
    const {rowCount, setRowCountFrozen, unfilteredSections} = usePickerPopoverRowCount(options ? () => options.getSections('') : undefined, searchKey);
    const [search, debouncedSearch, setSearch] = useDebouncedState({searchKey, value: ''}, undefined, {
        onDebouncedValueChange: (nextSearch) => {
            // A pending debounce may finish after the list has opened again or switched between sheet and popover.
            if (nextSearch.searchKey !== searchKey) {
                return;
            }
            setRowCountFrozen(!!nextSearch.value);
        },
    });
    const debouncedSearchValue = debouncedSearch.searchKey === searchKey ? debouncedSearch.value : '';
    const sections = debouncedSearchValue ? options?.getSections(debouncedSearchValue) : unfilteredSections;

    // A layout effect, so the span starts before the picker's own effects run and can end it. The popover only renders
    // the picker while it's open, so the picker mounts again on every open.
    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        startOpenCategoryPickerSpan();
    }, [isVisible]);

    const handleCategorySelect = (item: ListItem) => {
        // If clicking the same category that's already selected, treat it as deselection
        if (item.keyForList === selectedCategory) {
            onSelected?.({keyForList: '', searchText: ''});
        } else {
            onSelected?.(item);
        }
        onClose();
    };

    const createCategory = (categoryName: string) => {
        onCreateCategory?.(categoryName);
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={finishClosing}
            optionCount={rowCount}
            isSearchable={options?.hasSearchablePolicyCategories ?? false}
            title={translate('common.category')}
            backButtonSentryLabel={CONST.SENTRY_LABEL.CATEGORY_PICKER_MODAL.BACK_BUTTON}
            shouldShowHeader={shouldShowHeader || !!onAddCategory}
            headerActions={
                !!onAddCategory && (
                    <Tooltip text={translate('workspace.categories.addCategory')}>
                        <PressableWithFeedback
                            accessibilityLabel={translate('workspace.categories.addCategory')}
                            role={CONST.ROLE.BUTTON}
                            onPress={onAddCategory}
                            shouldUseAutoHitSlop
                            sentryLabel={addCategorySentryLabel}
                        >
                            <Icon
                                src={icons.Plus}
                                fill={theme.icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </PressableWithFeedback>
                    </Tooltip>
                )
            }
        >
            {options && sections && (
                <CategoryPickerList
                    options={options}
                    sections={sections}
                    searchValue={search.searchKey === searchKey ? search.value : ''}
                    debouncedSearchValue={debouncedSearchValue}
                    setSearchValue={(value) => setSearch({searchKey, value})}
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    onCreateCategory={onCreateCategory ? createCategory : undefined}
                    shouldAutoFocusSearchInput
                    ownerAccountID={ownerAccountID}
                />
            )}
        </AnchoredSelectionListPopover>
    );
}

export default CategoryPickerModal;
export type {CategoryPickerModalProps};
