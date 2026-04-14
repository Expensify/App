import React, {useRef} from 'react';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import TagPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

type TagPickerModalProps = {
    /** Callback to close the modal */
    onClose: () => void;

    /** The policy whose tags should be shown */
    policyID: string | undefined;

    /** Currently selected tag */
    selectedTag?: string;

    /** The current transaction tag of the expense */
    transactionTag?: string;

    /** Whether the policy has dependent tags */
    hasDependentTags?: boolean;

    /** Called when the user confirms a tag selection */
    onSelected?: (tag: string) => void;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function TagPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedTag = '',
    transactionTag,
    hasDependentTags,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
}: TagPickerModalProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const anchorRef = useRef<View>(null);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const tagListName = getTagList(policyTags, 0).name;

    const handleTagSelected = (item: Partial<OptionData>) => {
        // If clicking the same tag that's already selected, treat it as deselection
        if (item.keyForList === selectedTag) {
            onSelected?.('');
        } else {
            onSelected?.(item.searchText ?? item.text ?? '');
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
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH}}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
        >
            <View style={[{height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT, flexDirection: 'column'}, styles.pt4]}>
                <TagPicker
                    policyID={policyID}
                    tagListName={tagListName}
                    tagListIndex={0}
                    selectedTag={selectedTag}
                    transactionTag={transactionTag}
                    hasDependentTags={hasDependentTags}
                    onSubmit={handleTagSelected}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default TagPickerModal;
