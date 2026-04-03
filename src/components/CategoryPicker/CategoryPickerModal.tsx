import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import ConfirmCancelButtonRow from '@components/ConfirmCancelButtonRow';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const anchorRef = useRef<View>(null);

    const [pendingItem, setPendingItem] = useState<ListItem | undefined>(selectedCategory ? {keyForList: selectedCategory, searchText: selectedCategory} : undefined);

    const handleCategorySelect = (item: ListItem) => {
        // If clicking the same category that's already selected, treat it as deselection
        if (item.keyForList === pendingItem?.keyForList) {
            setPendingItem({keyForList: '', searchText: ''});
        } else {
            setPendingItem(item);
        }
    };

    const handleConfirm = () => {
        if (pendingItem) {
            onSelected?.(pendingItem);
        }
        setPendingItem(undefined);
        onClose();
    };

    const handleCancel = () => {
        setPendingItem(undefined);
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={handleCancel}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH}}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
        >
            <View style={[StyleUtils.getHeight(CONST.POPOVER_DROPDOWN_MAX_HEIGHT), styles.flexColumn, styles.pt4]}>
                <View style={styles.flex1}>
                    <CategoryPicker
                        selectedCategory={pendingItem?.keyForList}
                        policyID={policyID}
                        onSubmit={handleCategorySelect}
                    />
                </View>
                <ConfirmCancelButtonRow
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
