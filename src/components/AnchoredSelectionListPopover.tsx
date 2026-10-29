import useSelectionListPopoverLayout from '@hooks/useSelectionListPopoverLayout';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';
import Animated from 'react-native-reanimated';

import type PopoverWithMeasuredContentProps from './PopoverWithMeasuredContent/types';

import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import SelectionListPopoverHeader, {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from './SelectionListPopoverHeader';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type AnchoredSelectionListPopoverProps = {
    onClose: () => void;

    /** How many rows the list renders, section headings included, so the container can size itself to them */
    optionCount: number;

    /** Whether the list shows its search input, which the container makes room for and keeps above the keyboard */
    isSearchable: boolean;

    /** Name of the field the list picks for, shown in the header */
    title: string;

    /** Sentry label for the header's back button, so each list's presses are attributed to it */
    backButtonSentryLabel: string;

    /** Actions shown at the right end of the header, e.g. an add button */
    headerActions?: ReactNode;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header with `title` and, on a narrow layout, a back button that closes the list */
    shouldShowHeader?: boolean;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;

    /** The list */
    children: ReactNode;
} & Pick<PopoverWithMeasuredContentProps, 'isVisible' | 'anchorPosition' | 'anchorAlignment' | 'shouldMeasureAnchorPositionFromTop'>;

/**
 * The container a field's selection list opens in: a pop-over on a wide layout, a bottom sheet on a narrow one, sized
 * to the list and kept above the keyboard. The category, tag and tax pickers share it, so a fix to the container lands
 * in each of them at once.
 */
function AnchoredSelectionListPopover({
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    optionCount,
    isSearchable,
    title,
    backButtonSentryLabel,
    headerActions,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldShowHeader = false,
    shouldSwitchPositionIfOverflow = true,
    children,
}: AnchoredSelectionListPopoverProps) {
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const {popoverDimensions, innerContainerStyle, outerStyle, avoidKeyboard, contentStyle} = useSelectionListPopoverLayout({
        optionCount,
        isSearchable,
        popoverWidth,
        popoverHeight,
        shouldFitContentHeight,
        headerHeight: shouldShowHeader ? SELECTION_LIST_POPOVER_HEADER_HEIGHT : 0,
    });

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
                        title={title}
                        onBackButtonPress={onClose}
                        backButtonSentryLabel={backButtonSentryLabel}
                    >
                        {headerActions}
                    </SelectionListPopoverHeader>
                )}
                {children}
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

export default AnchoredSelectionListPopover;
export type {AnchoredSelectionListPopoverProps};
