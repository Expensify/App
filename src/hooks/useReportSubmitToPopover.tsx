import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import type {RefObject} from 'react';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ReportSubmitToContent from '@pages/ReportSubmitToContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import useOnyx from './useOnyx';
import usePopoverPosition from './usePopoverPosition';
import useResponsiveLayout from './useResponsiveLayout';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    minHeight: CONST.POPOVER_REPORT_SUBMIT_TO_CONTENT_HEIGHT,
};

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

type ReportSubmitToPopoverOpenOptions = {
    onSubmitSuccess?: () => void;
};

type UseReportSubmitToPopoverParams = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    anchorAlignment?: AnchorAlignment;
    /** When provided, resolves the anchor at open time (used by the shared Search host). */
    getAnchorRef?: () => RefObject<View | null> | null;
};

function useReportSubmitToPopover({reportID, onSubmitSuccess, anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT, getAnchorRef}: UseReportSubmitToPopoverParams) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // Bottom-docked Modal path only; aligns with Popover path that omits modal shell padding chrome
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
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
            const anchorToMeasure = getAnchorRef?.() ?? anchorRef;
            calculatePopoverPosition(anchorToMeasure, anchorAlignment).then((pos) => {
                setAnchorPosition({
                    horizontal: pos.horizontal,
                    vertical: pos.vertical,
                });
                setIsVisible(true);
            });
        },
        [calculatePopoverPosition, reportID, willAlertModalBecomeVisible, anchorAlignment, getAnchorRef],
    );

    const reportSubmitToPopover = useMemo(
        () => (
            <PopoverWithMeasuredContent
                anchorRef={anchorRef}
                isVisible={isVisible}
                onClose={closeReportSubmitToPopover}
                anchorPosition={anchorPosition}
                popoverDimensions={popoverDimensions}
                anchorAlignment={anchorAlignment}
                innerContainerStyle={{
                    ...(isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH}),
                    minHeight: popoverDimensions.minHeight,
                }}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldSwitchPositionIfOverflow
                shouldEnableNewFocusManagement
                shouldSkipRemeasurement
                shouldDisplayBelowModals
                shouldUseModalPaddingStyle
                shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
            >
                <View
                    collapsable={false}
                    style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}
                >
                    <ReportSubmitToContent
                        report={report}
                        policy={policy}
                        isLoadingReportData={isLoadingReportData}
                        onDismiss={closeReportSubmitToPopover}
                        onSubmitSuccess={handleCombinedSubmitSuccess}
                        shouldDismissRHPAfterSubmit={false}
                    />
                </View>
            </PopoverWithMeasuredContent>
        ),
        [
            StyleUtils,
            styles.w100,
            styles.flexColumn,
            styles.pt4,
            isSmallScreenWidth,
            isVisible,
            closeReportSubmitToPopover,
            anchorPosition,
            anchorAlignment,
            anchorRef,
            report,
            policy,
            isLoadingReportData,
            handleCombinedSubmitSuccess,
        ],
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
