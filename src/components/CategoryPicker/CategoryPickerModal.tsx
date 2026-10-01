import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';

import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

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

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /**
     * Whether the pop-over shrinks to the height its list actually needs, treating `popoverHeight` as a ceiling
     * rather than a fixed height. Opted into by the expense form's field rows, where a fixed height leaves a
     * short list floating in an empty box that runs past the panel the row was opened from.
     */
    shouldFitContentHeight?: boolean;

    /**
     * Whether the pop-over may move itself to the other side of the anchor when it overflows. It shifts by a whole
     * pop-over height when it does, so a caller that has already picked the side off its own measurements turns
     * this off rather than have both decisions fight and land the list on top of its anchor.
     */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function CategoryPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedCategory,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive} = useKeyboardState();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    // The pop-over is sized from the rows the list reports it renders, not from the category count: a nested
    // name adds a row for each parent it hangs off, so counting categories leaves the pop-over shorter than its
    // own list and hides options behind a scroll with empty space below. Until the list has reported, the
    // category count is the closest guess available. One row is the floor, so a one-row list is exactly as tall
    // as its one row.
    const categoriesCount = policyCategories ?? 0;
    const isSearchable = categoriesCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const estimatedContentHeight = getSelectionListPopoverContentHeight({optionCount: Math.max(renderedRowCount ?? categoriesCount, 1), isSearchable});

    // A bottom sheet is sized by the screen, so the content estimate only applies to the pop-over.
    const resolvedHeight = shouldFitContentHeight && !isSmallScreenWidth ? Math.min(popoverHeight, estimatedContentHeight) : popoverHeight;
    const popoverDimensions = {width: popoverWidth, height: resolvedHeight};

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
            // A bottom sheet spans the screen, so only the pop-over is held to the width it was given.
            innerContainerStyle={isSmallScreenWidth ? undefined : StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}>
                <CategoryPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    addBottomSafeAreaPadding={isSmallScreenWidth && !isKeyboardActive}
                    shouldAutoFocusSearchInput
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
