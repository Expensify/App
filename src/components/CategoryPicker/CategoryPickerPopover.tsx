import React, {useCallback, useRef} from 'react';
import type {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import CategoryPicker from '.';

type CategoryPickerPopoverProps = {
    /** The ID of the policy to load categories from */
    policyID: string | undefined;

    /** Currently selected category */
    selectedCategory: string;

    /** Callback when a category is selected — receives the raw category name string */
    onCategorySelected: (category: string) => void;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children'>;

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const POPOVER_DIMENSIONS = {
    height: 450,
    width: 350,
};

function CategoryPickerPopover({policyID, selectedCategory, onCategorySelected, ...popoverProps}: CategoryPickerPopoverProps) {
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const anchorRef = useRef<View>(null);

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
            popoverDimensions={POPOVER_DIMENSIONS}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: POPOVER_DIMENSIONS.width}}
            anchorAlignment={DEFAULT_ANCHOR_ORIGIN}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...popoverProps}
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
