import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConfirmCancelButtonRow from '@components/ConfirmCancelButtonRow';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {ListItem} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
    /** Whether the popover is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;

    /** Pixel coordinates for the anchor (as returned by measureInWindow) */
    anchorPosition: {
        horizontal: number;
        vertical: number;
    };

    /** The policy whose categories should be shown */
    policyID: string | undefined;

    /** Currently selected category */
    selectedCategory?: string;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Override anchor alignment — defaults to LEFT/TOP so the popover opens to the right */
    anchorAlignment?: {
        horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
        vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    };

    /** When true the popover measures position from the top of anchorPosition.vertical */
    shouldPositionFromTop?: boolean;
};

function CategoryPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedCategory,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldPositionFromTop = false,
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const anchorRef = useRef<View>(null);

    const [pendingItem, setPendingItem] = useState<ListItem | undefined>(undefined);

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
            shouldMeasureAnchorPositionFromTop={shouldPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
        >
            <View style={[{height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT, flexDirection: 'column'}, styles.pt4]}>
                <View style={styles.flex1}>
                    <CategoryPicker
                        policyID={policyID}
                        selectedCategory={pendingItem?.keyForList ?? selectedCategory}
                        onSubmit={setPendingItem}
                    />
                </View>
                <ConfirmCancelButtonRow
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    isConfirmDisabled={!pendingItem}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
