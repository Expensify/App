import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import SelectionListPopoverHeader, {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useLocalize from '@hooks/useLocalize';
import useSelectionListPopoverLayout from '@hooks/useSelectionListPopoverLayout';

import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import type {ReportListSize} from '@pages/iou/request/step/IOURequestEditReportCommon';
import type {ReportPickerListProps} from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerActions';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';
import Animated from 'react-native-reanimated';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type ReportPickerPopoverProps = {
    onClose: () => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header naming the field and, on a narrow layout, a back button that closes the list */
    shouldShowHeader?: boolean;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

type ReportPickerModalProps = ReportPickerListProps & ReportPickerPopoverProps;

/** The container around the report list: a pop-over on a wide layout, a bottom sheet on a narrow one, sized to the list */
function ReportPickerPopover({
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
    shouldShowHeader = false,
    listSize,
    children,
}: ReportPickerPopoverProps & {listSize: ReportListSize; children: ReactNode}) {
    const {translate} = useLocalize();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const {popoverDimensions, innerContainerStyle, outerStyle, avoidKeyboard, contentStyle} = useSelectionListPopoverLayout({
        optionCount: listSize.rowCount,
        isSearchable: listSize.isSearchable,
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
                        title={translate('common.report')}
                        onBackButtonPress={onClose}
                        backButtonSentryLabel={CONST.SENTRY_LABEL.REPORT_PICKER_MODAL.BACK_BUTTON}
                    />
                )}
                {children}
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

/**
 * The report list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one. The
 * list is the one the full-page selector shows, `New report` row included, without the page around it. The list renders
 * the container itself and hands it its size in the same render, so the container never learns the size through an effect.
 */
function ReportPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment,
    shouldMeasureAnchorPositionFromTop,
    popoverWidth,
    popoverHeight,
    shouldFitContentHeight,
    shouldSwitchPositionIfOverflow,
    shouldShowHeader,
    ...listProps
}: ReportPickerModalProps) {
    return (
        <IOURequestEditReportCommon
            {...listProps}
            onDismiss={onClose}
            // The list closes the container before it navigates on, e.g. to the restricted-action page, so the sheet never stays over the new screen.
            onNavigateAway={onClose}
            shouldAutoFocusSearchInput
            renderInContainer={(list, listSize) => (
                <ReportPickerPopover
                    isVisible={isVisible}
                    onClose={onClose}
                    anchorPosition={anchorPosition}
                    anchorAlignment={anchorAlignment}
                    shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
                    popoverWidth={popoverWidth}
                    popoverHeight={popoverHeight}
                    shouldFitContentHeight={shouldFitContentHeight}
                    shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
                    shouldShowHeader={shouldShowHeader}
                    listSize={listSize}
                >
                    {list}
                </ReportPickerPopover>
            )}
        />
    );
}

export default ReportPickerModal;
export type {ReportPickerModalProps};
