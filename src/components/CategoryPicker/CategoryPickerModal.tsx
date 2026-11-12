import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';

import {getEnabledCategoriesCount, getVisibleCategories} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import startOpenCategoryPickerSpan from '@libs/telemetry/startOpenCategoryPickerSpan';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import policyCategoriesVisibilitySelector from '@selectors/PolicyCategories';
import React, {useLayoutEffect, useState} from 'react';

import CategoryPicker from '.';

type CategoryPickerModalProps = {
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

    /** Sentry label for the add button, so each caller's presses are attributed to it */
    addCategorySentryLabel?: SentryLabel;

    /** Receives the searched-for name when the user taps the create row. The row is offered only when this is passed. */
    onCreateCategory?: (categoryName: string) => void;

    /** The account the expense belongs to, passed only when the current user owns it, so the list shows just the categories they can use */
    ownerAccountID?: number;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'shouldShowHeader' | 'children'>;

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
    ...popoverProps
}: CategoryPickerModalProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: policyCategoriesVisibilitySelector});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    // Counts what the picker lists, so the search input shows only when the owner's own list is long enough.
    const categoriesCount = getEnabledCategoriesCount(ownerAccountID === undefined || !policyCategories ? policyCategories : getVisibleCategories(policyCategories, ownerAccountID));

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
            optionCount={renderedRowCount ?? categoriesCount}
            isSearchable={categoriesCount >= searchInputThreshold}
            title={translate('common.category')}
            backButtonSentryLabel={CONST.SENTRY_LABEL.CATEGORY_PICKER_MODAL.BACK_BUTTON}
            shouldShowHeader={!!onAddCategory}
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
            <CategoryPicker
                onRenderedRowCountChange={setRenderedRowCount}
                selectedCategory={selectedCategory}
                policyID={policyID}
                onSubmit={handleCategorySelect}
                onCreateCategory={onCreateCategory ? createCategory : undefined}
                shouldAutoFocusSearchInput
                shouldAlwaysShowGLCode={shouldAlwaysShowGLCode}
                searchInputThreshold={searchInputThreshold}
                ownerAccountID={ownerAccountID}
            />
        </AnchoredSelectionListPopover>
    );
}

export default CategoryPickerModal;
