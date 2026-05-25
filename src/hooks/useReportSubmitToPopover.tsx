import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ReportSubmitToContent from '@pages/ReportSubmitToContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePopoverPosition from './usePopoverPosition';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type ReportSubmitToPopoverOpenOptions = {
    onSubmitSuccess?: () => void;
};

type UseReportSubmitToPopoverParams = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
};

function useReportSubmitToPopover({reportID, onSubmitSuccess}: UseReportSubmitToPopoverParams) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const anchorRef = useRef<View>(null);
    const oneShotOnSubmitSuccessRef = useRef<(() => void) | undefined>(undefined);
    const {calculatePopoverPosition} = usePopoverPosition();
    const [isVisible, setIsVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {selector: willAlertModalBecomeVisibleSelector});

    const closeReportSubmitToPopover = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleCombinedSubmitSuccess = useCallback(() => {
        const oneShot = oneShotOnSubmitSuccessRef.current;
        oneShotOnSubmitSuccessRef.current = undefined;
        oneShot?.();
        onSubmitSuccess?.();
    }, [onSubmitSuccess]);

    const openReportSubmitToPopover = useCallback(
        (options?: ReportSubmitToPopoverOpenOptions) => {
            if (!reportID || willAlertModalBecomeVisible) {
                return;
            }
            oneShotOnSubmitSuccessRef.current = options?.onSubmitSuccess;
            void calculatePopoverPosition(anchorRef, ANCHOR_ALIGNMENT).then((pos) => {
                setAnchorPosition({
                    horizontal: pos.horizontal,
                    vertical: pos.vertical,
                });
                setIsVisible(true);
            });
        },
        [calculatePopoverPosition, reportID, willAlertModalBecomeVisible],
    );

    const reportSubmitToPopover = useMemo(
        () => (
            <PopoverWithMeasuredContent
                anchorRef={anchorRef}
                isVisible={isVisible}
                onClose={closeReportSubmitToPopover}
                anchorPosition={anchorPosition}
                popoverDimensions={popoverDimensions}
                anchorAlignment={ANCHOR_ALIGNMENT}
                innerContainerStyle={StyleUtils.getWidthStyle(popoverDimensions.width)}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldSwitchPositionIfOverflow
                shouldEnableNewFocusManagement
                shouldSkipRemeasurement
                shouldDisplayBelowModals
            >
                <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn]}>
                    <ReportSubmitToContent
                        report={report}
                        policy={policy}
                        isLoadingReportData={isLoadingReportData}
                        onDismiss={closeReportSubmitToPopover}
                        shouldShowTitle
                        onSubmitSuccess={handleCombinedSubmitSuccess}
                        shouldDismissRHPAfterSubmit={false}
                    />
                </View>
            </PopoverWithMeasuredContent>
        ),
        [StyleUtils, styles.flexColumn, isVisible, closeReportSubmitToPopover, anchorPosition, report, policy, isLoadingReportData, handleCombinedSubmitSuccess],
    );

    return {
        anchorRef,
        openReportSubmitToPopover,
        closeReportSubmitToPopover,
        isReportSubmitToPopoverVisible: isVisible,
        reportSubmitToPopover,
    };
}

export type {ReportSubmitToPopoverOpenOptions};
export default useReportSubmitToPopover;
