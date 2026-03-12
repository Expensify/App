import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmCancelButtonRow from './ConfirmCancelButtonRow';
import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import TagPicker from './TagPicker';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

type TagPickerModalProps = {
    /** Whether the popover is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;

    /** Pixel coordinates for the anchor (as returned by measureInWindow) */
    anchorPosition: {
        horizontal: number;
        vertical: number;
    };

    /** The policy whose tags should be shown */
    policyID: string | undefined;

    /** Currently selected tag */
    selectedTag?: string;

    /** Called when the user confirms a tag selection */
    onSelected?: (tag: string) => void;

    /** Override anchor alignment — defaults to LEFT/TOP so the popover opens to the right */
    anchorAlignment?: {
        horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
        vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    };

    /** When true the popover measures position from the top of anchorPosition.vertical */
    shouldPositionFromTop?: boolean;
};

function TagPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedTag = '',
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldPositionFromTop = false,
}: TagPickerModalProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const anchorRef = useRef<View>(null);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const tagListName = getTagList(policyTags, 0).name;

    const [pendingItem, setPendingItem] = useState<Partial<OptionData> | undefined>(undefined);

    const handleTagSelected = (item: Partial<OptionData>) => {
        setPendingItem(item);
    };

    const handleConfirm = () => {
        if (pendingItem) {
            onSelected?.(pendingItem.searchText ?? pendingItem.text ?? '');
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
                    <TagPicker
                        policyID={policyID}
                        tagListName={tagListName}
                        tagListIndex={0}
                        selectedTag={pendingItem?.searchText ?? pendingItem?.text ?? selectedTag}
                        onSubmit={handleTagSelected}
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

export default TagPickerModal;
