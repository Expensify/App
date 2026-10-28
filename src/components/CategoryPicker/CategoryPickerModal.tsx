import Icon from '@components/Icon';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListPopoverHeader, {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSelectionListPopoverLayout from '@hooks/useSelectionListPopoverLayout';
import useTheme from '@hooks/useTheme';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';
import Animated from 'react-native-reanimated';

import CategoryPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type CategoryPickerModalProps = {
    onClose: () => void;

    /** The policy whose categories should be shown */
    policyID: string | undefined;

    selectedCategory?: string;

    /** Whether to show GL codes under each category regardless of the workspace setting */
    shouldAlwaysShowGLCode?: boolean;

    /** Number of enabled categories at which the search input appears. The content height estimate uses the same value. */
    searchInputThreshold?: number;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header with a back button and an add button, for users who can add a category to the workspace */
    onAddCategory?: () => void;

    /** Sentry label for the add button, so each caller's presses are attributed to it */
    addCategorySentryLabel?: string;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function CategoryPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedCategory,
    shouldAlwaysShowGLCode = false,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
    onAddCategory,
    addCategorySentryLabel,
}: CategoryPickerModalProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    const categoriesCount = policyCategories ?? 0;
    const {popoverDimensions, innerContainerStyle, outerStyle, avoidKeyboard, contentStyle} = useSelectionListPopoverLayout({
        optionCount: renderedRowCount ?? categoriesCount,
        isSearchable: categoriesCount >= searchInputThreshold,
        popoverWidth,
        popoverHeight,
        shouldFitContentHeight,
        headerHeight: onAddCategory ? SELECTION_LIST_POPOVER_HEADER_HEIGHT : 0,
    });

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
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={innerContainerStyle}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
            avoidKeyboard={avoidKeyboard}
            outerStyle={outerStyle}
            // The sheet sizes itself to the window and its list scrolls on its own, so the modal must not cap or wrap it in landscape.
            shouldLimitHeightIfBottomDockedInLandscapeMode={false}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <Animated.View style={contentStyle}>
                {!!onAddCategory && (
                    <SelectionListPopoverHeader
                        title={translate('common.category')}
                        onBackButtonPress={onClose}
                        backButtonSentryLabel={CONST.SENTRY_LABEL.CATEGORY_PICKER_MODAL.BACK_BUTTON}
                    >
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
                    </SelectionListPopoverHeader>
                )}
                <CategoryPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    shouldAutoFocusSearchInput
                    shouldAlwaysShowGLCode={shouldAlwaysShowGLCode}
                    searchInputThreshold={searchInputThreshold}
                />
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
