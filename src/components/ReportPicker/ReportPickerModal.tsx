import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';

import useLocalize from '@hooks/useLocalize';

import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import type {ReportPickerListProps} from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerActions';

import CONST from '@src/CONST';

import React from 'react';

type ReportPickerModalProps = ReportPickerListProps &
    Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'children'>;

/**
 * The report list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one. The
 * list is the one the full-page selector shows, `New report` row included, without the page around it. The list renders
 * the container itself and hands it its size in the same render, so the container never learns the size through an effect.
 */
function ReportPickerModal({
    isVisible,
    onClose,
    onModalHide,
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
    const {translate} = useLocalize();

    return (
        <IOURequestEditReportCommon
            {...listProps}
            onDismiss={onClose}
            // The list closes the container before it navigates on, e.g. to the restricted-action page, so the sheet never stays over the new screen.
            onNavigateAway={onClose}
            shouldAutoFocusSearchInput
            renderInContainer={(list, listSize) => (
                <AnchoredSelectionListPopover
                    isVisible={isVisible}
                    onClose={onClose}
                    onModalHide={onModalHide}
                    anchorPosition={anchorPosition}
                    anchorAlignment={anchorAlignment}
                    shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
                    optionCount={listSize.rowCount}
                    isSearchable={listSize.isSearchable}
                    title={translate('common.report')}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.REPORT_PICKER_MODAL.BACK_BUTTON}
                    popoverWidth={popoverWidth}
                    popoverHeight={popoverHeight}
                    shouldFitContentHeight={shouldFitContentHeight}
                    shouldShowHeader={shouldShowHeader}
                    shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
                >
                    {list}
                </AnchoredSelectionListPopover>
            )}
        />
    );
}

export default ReportPickerModal;
export type {ReportPickerModalProps};
