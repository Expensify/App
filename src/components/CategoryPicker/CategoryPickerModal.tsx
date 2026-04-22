import React, {useRef} from 'react';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import CategoryPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

type CategoryPickerModalProps = {
    /** Callback to close the modal */
    onClose: () => void;

    /** The policy whose categories should be shown */
    policyID: string | undefined;

    /** Currently selected category */
    selectedCategory?: string;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;
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
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const anchorRef = useRef<View>(null);

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
            innerContainerStyle={StyleUtils.getWidthStyle(CONST.POPOVER_DROPDOWN_WIDTH)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
        >
            <View style={[StyleUtils.getHeight(CONST.POPOVER_DROPDOWN_MAX_HEIGHT), styles.flexColumn, styles.pt4]}>
                <CategoryPicker
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
