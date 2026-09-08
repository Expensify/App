import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useRef} from 'react';
import {View} from 'react-native';

import TagPicker from '.';

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
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

    /** Optional override for whether to show GL codes under each tag */
    shouldShowGLCode?: boolean;

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
    shouldShowGLCode,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
}: TagPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive} = useKeyboardState();

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
            innerContainerStyle={StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}>
                <TagPicker
                    policyID={policyID}
                    tagListName={tagListName}
                    tagListIndex={0}
                    selectedTag={selectedTag}
                    transactionTag={transactionTag}
                    hasDependentTags={hasDependentTags}
                    shouldShowGLCode={shouldShowGLCode}
                    onSubmit={handleTagSelected}
                    addBottomSafeAreaPadding={isSmallScreenWidth && !isKeyboardActive}
                    shouldAutoFocusSearchInput
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default TagPickerModal;
