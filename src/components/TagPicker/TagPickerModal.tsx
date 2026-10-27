import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import SelectionListPopoverHeader, {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useOnyx from '@hooks/useOnyx';
import useSelectionListPopoverLayout from '@hooks/useSelectionListPopoverLayout';

import {getCountOfEnabledTagsOfList, getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';
import Animated from 'react-native-reanimated';

import TagPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type TagPickerModalProps = {
    onClose: () => void;

    /** The policy whose tags should be shown */
    policyID: string | undefined;

    selectedTag?: string;

    /** The current transaction tag of the expense */
    transactionTag?: string;

    /** Whether the policy has dependent tags */
    hasDependentTags?: boolean;

    /** Optional override for whether to show GL codes under each tag */
    shouldShowGLCode?: boolean;

    /** Called when the user confirms a tag selection */
    onSelected?: (tag: string) => void;

    /** Index of the tag list to show. Defaults to the first list */
    tagListIndex?: number;

    /** Number of enabled tags at which the search input appears. The content height estimate uses the same value. */
    searchInputThreshold?: number;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header with the tag list's name and, on a narrow layout, a back button that closes the list */
    shouldShowHeader?: boolean;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
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
    tagListIndex = 0,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
    shouldShowHeader = false,
}: TagPickerModalProps) {
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [renderedRowCount, setRenderedRowCount] = useState<number>();
    const policyTagList = getTagList(policyTags, tagListIndex);
    const tagsCount = getCountOfEnabledTagsOfList(policyTagList.tags);

    const {popoverDimensions, innerContainerStyle, outerStyle, avoidKeyboard, contentStyle} = useSelectionListPopoverLayout({
        optionCount: renderedRowCount ?? tagsCount,
        isSearchable: tagsCount >= searchInputThreshold,
        popoverWidth,
        popoverHeight,
        shouldFitContentHeight,
        headerHeight: shouldShowHeader ? SELECTION_LIST_POPOVER_HEADER_HEIGHT : 0,
    });

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
                {shouldShowHeader && (
                    <SelectionListPopoverHeader
                        title={policyTagList.name}
                        onBackButtonPress={onClose}
                        backButtonSentryLabel={CONST.SENTRY_LABEL.TAG_PICKER_MODAL.BACK_BUTTON}
                    />
                )}
                <TagPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    policyID={policyID}
                    tagListName={policyTagList.name}
                    tagListIndex={tagListIndex}
                    selectedTag={selectedTag}
                    transactionTag={transactionTag}
                    hasDependentTags={hasDependentTags}
                    shouldShowGLCode={shouldShowGLCode}
                    onSubmit={handleTagSelected}
                    shouldAutoFocusSearchInput
                    searchInputThreshold={searchInputThreshold}
                />
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

export default TagPickerModal;
