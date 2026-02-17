import React, {useCallback} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {ListItem} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import CategoryPicker from '.';

type PopoverPosition = {
    horizontal: number;
    vertical: number;
};

type CategoryPickerPopoverProps = {
    /** The ID of the policy to load categories from */
    policyID: string | undefined;

    /** Currently selected category */
    selectedCategory: string;

    /** Whether the popover is visible */
    isVisible: boolean;

    /** Callback when the popover is closed without a selection */
    onClose: () => void;

    /** Ref for the anchor element used to position the popover */
    anchorRef: RefObject<View | null>;

    /** Popover anchor position */
    anchorPosition: PopoverPosition;

    /** Whether the popover should be positioned above the anchor (true when near bottom of screen) */
    shouldPositionFromTop?: boolean;

    /** Callback when a category is selected — receives the raw category name string */
    onCategorySelected: (category: string) => void;
};

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const POPOVER_DIMENSIONS = {
    height: 450,
    width: 350,
};

function CategoryPickerPopover({policyID, selectedCategory, isVisible, onClose, anchorRef, anchorPosition, shouldPositionFromTop = false, onCategorySelected}: CategoryPickerPopoverProps) {
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const handleCategorySelected = useCallback(
        (item: ListItem) => {
            if (!item.keyForList) {
                return;
            }
            onCategorySelected(String(item.keyForList));
        },
        [onCategorySelected],
    );

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={POPOVER_DIMENSIONS}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: POPOVER_DIMENSIONS.width}}
            anchorAlignment={DEFAULT_ANCHOR_ORIGIN}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
        >
            <CategoryPicker
                policyID={policyID}
                selectedCategory={selectedCategory}
                onSubmit={handleCategorySelected}
            />
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerPopover;
