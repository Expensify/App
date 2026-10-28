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

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

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
    addCategorySentryLabel?: string;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'shouldShowHeader' | 'children'>;

function CategoryPickerModal({
    policyID,
    selectedCategory,
    shouldAlwaysShowGLCode = false,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    onSelected,
    onAddCategory,
    addCategorySentryLabel,
    onClose,
    ...popoverProps
}: CategoryPickerModalProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    const categoriesCount = policyCategories ?? 0;

    const handleCategorySelect = (item: ListItem) => {
        // If clicking the same category that's already selected, treat it as deselection
        if (item.keyForList === selectedCategory) {
            onSelected?.({keyForList: '', searchText: ''});
        } else {
            onSelected?.(item);
        }
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
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
                shouldAutoFocusSearchInput
                shouldAlwaysShowGLCode={shouldAlwaysShowGLCode}
                searchInputThreshold={searchInputThreshold}
            />
        </AnchoredSelectionListPopover>
    );
}

export default CategoryPickerModal;
