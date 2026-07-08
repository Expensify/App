import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSubmitToEmail} from '@libs/PolicyUtils';

import ReportSubmitToContent from '@pages/ReportSubmitToContent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {RefObject} from 'react';

import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import useIsInLandscapeMode from './useIsInLandscapeMode';
import useOnyx from './useOnyx';
import usePopoverPosition from './usePopoverPosition';
import usePrevious from './usePrevious';
import useResponsiveLayout from './useResponsiveLayout';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';
import useViewportOffsetTop from './useViewportOffsetTop';
import useWindowDimensions from './useWindowDimensions';

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
    /** When provided, called with the selected submit-to email instead of `submitReport`. */
    onSubmitWithManagerEmail?: (managerEmail: string, managerAccountID?: number) => void;
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
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    const isInLandscapeMode = useIsInLandscapeMode();
    // Bottom-docked Modal path only; aligns with Popover path that omits modal shell padding chrome
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isBottomDockedInLandscape = isSmallScreenWidth && isInLandscapeMode;

    const submitToPopoverContentHeight = useMemo(() => {
        if (!isBottomDockedInLandscape) {
            return popoverDimensions.height;
        }

        return Math.min(popoverDimensions.height, windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE);
    }, [isBottomDockedInLandscape, windowHeight]);
    const anchorRef = useRef<View>(null);
    const oneShotOnSubmitSuccessRef = useRef<(() => void) | undefined>(undefined);
    const onSubmitWithManagerEmailRef = useRef<ReportSubmitToPopoverOpenOptions['onSubmitWithManagerEmail']>(undefined);
    const canSubmitRef = useRef(true);
    const ignoreNextSearchSubmitPressRef = useRef(false);
    const pendingSearchSubmitOpenOptionsRef = useRef<ReportSubmitToPopoverOpenOptions | undefined>(undefined);
    const {calculatePopoverPosition} = usePopoverPosition();
    const [isVisible, setIsVisible] = useState(false);
    const wasPopoverVisible = usePrevious(isVisible);
    // Do not mount the submit-to popover modal until first open. Avoids a second RN Modal in the tree
    // while the More menu is open on iOS (which blocks follow-up confirm dialogs such as Cancel payment).
    const shouldRenderSubmitToPopover = wasPopoverVisible || isVisible;
    const [isDismissGuardActive, setIsDismissGuardActive] = useState(false);
    const [isSearchSubmitFlow, setIsSearchSubmitFlow] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {
        selector: willAlertModalBecomeVisibleSelector,
    });
    // Mirror willAlertModalBecomeVisible in a ref so the openReportSubmitToPopover callback can read the latest value
    // at press time without taking it as a dependency. Keeping it out of the deps keeps the callback (and, for the
    // shared Search host, the context value built from it) referentially stable across MODAL changes so opening an
    // unrelated popover/modal does not re-render every Search row.
    const willAlertModalBecomeVisibleRef = useRef(willAlertModalBecomeVisible);
    useEffect(() => {
        willAlertModalBecomeVisibleRef.current = willAlertModalBecomeVisible;
    }, [willAlertModalBecomeVisible]);

    const submitToContentKey = useMemo(() => `${reportID}:${getSubmitToEmail(policy, report)}`, [reportID, policy, report]);

    const clearDismissGuard = useCallback(() => {
        setIsDismissGuardActive(false);
        ignoreNextSearchSubmitPressRef.current = false;
    }, []);

    const consumeIgnoreNextSearchSubmitPress = useCallback(() => {
        if (!ignoreNextSearchSubmitPressRef.current) {
            return false;
        }
        clearDismissGuard();
        return true;
    }, [clearDismissGuard]);

    const closeReportSubmitToPopover = useCallback(() => {
        canSubmitRef.current = false;
        onSubmitWithManagerEmailRef.current = undefined;
        oneShotOnSubmitSuccessRef.current = undefined;
        pendingSearchSubmitOpenOptionsRef.current = undefined;
        setIsSearchSubmitFlow(false);
        // Block click-through on the row Submit button after dismiss; pointer-events use isDismissGuardActive until the modal hides.
        ignoreNextSearchSubmitPressRef.current = true;
        setIsDismissGuardActive(true);
        // Same-turn guard for narrow layout where a second popover open can fire before pointer-events update.
        queueMicrotask(() => {
            ignoreNextSearchSubmitPressRef.current = false;
        });
        setIsVisible(false);
    }, []);

    const handleReportSubmitToPopoverModalHide = useCallback(() => {
        clearDismissGuard();
    }, [clearDismissGuard]);

    const handleCombinedSubmitSuccess = useCallback(() => {
        if (!canSubmitRef.current) {
            return;
        }
        const oneShot = oneShotOnSubmitSuccessRef.current;
        oneShotOnSubmitSuccessRef.current = undefined;
        onSubmitWithManagerEmailRef.current = undefined;
        setIsSearchSubmitFlow(false);
        oneShot?.();
        onSubmitSuccess?.();
    }, [onSubmitSuccess]);

    const handleSearchSubmitWithManagerEmail = useCallback((managerEmail: string, managerAccountID?: number) => {
        if (!canSubmitRef.current) {
            return;
        }
        const onSubmit = onSubmitWithManagerEmailRef.current;
        if (!onSubmit) {
            return;
        }
        canSubmitRef.current = false;
        onSubmitWithManagerEmailRef.current = undefined;
        setIsSearchSubmitFlow(false);
        onSubmit(managerEmail, managerAccountID);
    }, []);

    const showReportSubmitToPopover = useCallback(
        (options?: ReportSubmitToPopoverOpenOptions) => {
            canSubmitRef.current = true;
            clearDismissGuard();
            oneShotOnSubmitSuccessRef.current = options?.onSubmitSuccess;
            onSubmitWithManagerEmailRef.current = options?.onSubmitWithManagerEmail;
            setIsSearchSubmitFlow(!!options?.onSubmitWithManagerEmail);
            const anchorToMeasure = getAnchorRef?.() ?? anchorRef;
            calculatePopoverPosition(anchorToMeasure, anchorAlignment)
                .then((pos) => {
                    setAnchorPosition({
                        horizontal: pos.horizontal,
                        vertical: pos.vertical,
                    });
                    setIsVisible(true);
                })
                .catch(() => {
                    clearDismissGuard();
                });
        },
        [calculatePopoverPosition, anchorAlignment, getAnchorRef, clearDismissGuard],
    );

    useEffect(() => {
        if (!reportID || willAlertModalBecomeVisible || !pendingSearchSubmitOpenOptionsRef.current) {
            return;
        }

        const pendingOptions = pendingSearchSubmitOpenOptionsRef.current;
        pendingSearchSubmitOpenOptionsRef.current = undefined;
        showReportSubmitToPopover(pendingOptions);
    }, [reportID, willAlertModalBecomeVisible, showReportSubmitToPopover]);

    const openReportSubmitToPopover = useCallback(
        (options?: ReportSubmitToPopoverOpenOptions) => {
            if (!reportID) {
                return;
            }

            if (willAlertModalBecomeVisibleRef.current) {
                pendingSearchSubmitOpenOptionsRef.current = options;
                return;
            }

            showReportSubmitToPopover(options);
        },
        [reportID, showReportSubmitToPopover],
    );

    const popoverContainerStyle = useMemo(() => (isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH}), [isSmallScreenWidth, styles.w100]);

    const outerStyle = useMemo(
        () => ({
            ...(isSmallScreenWidth ? StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop) : {}),
            ...popoverContainerStyle,
        }),
        [StyleUtils, isSmallScreenWidth, popoverContainerStyle, viewportOffsetTop, windowHeight],
    );

    const innerContainerStyle = useMemo(
        () => ({
            ...popoverContainerStyle,
            ...(isBottomDockedInLandscape ? styles.getPopoverMaxHeight(windowHeight, true) : {minHeight: popoverDimensions.minHeight}),
        }),
        [popoverContainerStyle, isBottomDockedInLandscape, windowHeight, styles],
    );

    const reportSubmitToPopover = useMemo(() => {
        if (!shouldRenderSubmitToPopover) {
            return null;
        }

        return (
            <PopoverWithMeasuredContent
                innerContainerStyle={innerContainerStyle}
                outerStyle={outerStyle}
                anchorRef={anchorRef}
                isVisible={isVisible}
                onClose={closeReportSubmitToPopover}
                onModalHide={handleReportSubmitToPopoverModalHide}
                anchorPosition={anchorPosition}
                popoverDimensions={popoverDimensions}
                anchorAlignment={anchorAlignment}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldSwitchPositionIfOverflow
                shouldEnableNewFocusManagement
                shouldSkipRemeasurement
                shouldDisplayBelowModals
                shouldUseModalPaddingStyle
                avoidKeyboard
                shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
            >
                <View
                    collapsable={false}
                    style={[StyleUtils.getHeight(submitToPopoverContentHeight), styles.flexColumn, styles.flex1, styles.w100, styles.pt4]}
                >
                    <ReportSubmitToContent
                        key={submitToContentKey}
                        report={report}
                        policy={policy}
                        isLoadingReportData={isLoadingReportData}
                        onDismiss={closeReportSubmitToPopover}
                        onSubmitSuccess={handleCombinedSubmitSuccess}
                        onSubmitWithManagerEmail={isSearchSubmitFlow ? handleSearchSubmitWithManagerEmail : undefined}
                        canSubmitRef={canSubmitRef}
                        shouldDismissRHPAfterSubmit={false}
                    />
                </View>
            </PopoverWithMeasuredContent>
        );
    }, [
        StyleUtils,
        styles.flexColumn,
        styles.flex1,
        styles.pt4,
        styles.w100,
        innerContainerStyle,
        outerStyle,
        submitToPopoverContentHeight,
        shouldRenderSubmitToPopover,
        isVisible,
        closeReportSubmitToPopover,
        handleReportSubmitToPopoverModalHide,
        anchorPosition,
        anchorAlignment,
        anchorRef,
        report,
        policy,
        isLoadingReportData,
        handleCombinedSubmitSuccess,
        isSearchSubmitFlow,
        handleSearchSubmitWithManagerEmail,
        submitToContentKey,
    ]);

    return {
        anchorRef,
        openReportSubmitToPopover,
        closeReportSubmitToPopover,
        isReportSubmitToPopoverVisible: isVisible,
        isReportSubmitToDismissGuardActive: isDismissGuardActive,
        consumeIgnoreNextSearchSubmitPress,
        reportSubmitToPopover,
    };
}

export type {ReportSubmitToPopoverOpenOptions};
export default useReportSubmitToPopover;
