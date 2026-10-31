import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSubmitToEmail} from '@libs/PolicyUtils';

import ReportSubmitToContent from '@pages/ReportSubmitToContent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import calculateModalHeightInLandscapeMode from '@src/utils/calculateModalHeightInLandscapeMode';

import type {ComponentRef, RefObject} from 'react';

import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import useIsInLandscapeMode from './useIsInLandscapeMode';
import useKeyboardState from './useKeyboardState';
import useOnyx from './useOnyx';
import {usePersonalDetail} from './usePersonalDetails';
import usePopoverPosition from './usePopoverPosition';
import usePrevious from './usePrevious';
import useResponsiveLayout from './useResponsiveLayout';
import useSafeAreaInsets from './useSafeAreaInsets';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';
import useViewportOffsetTop from './useViewportOffsetTop';
import useWindowDimensions from './useWindowDimensions';

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    portraitHeight: CONST.POPOVER_REPORT_SUBMIT_TO_CONTENT_HEIGHT,
};

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

type ReportSubmitToPopoverOpenOptions = {
    onSubmitSuccess?: () => void;
    /** When provided, called with the selected submit-to email instead of `submitReport`. */
    onSubmitWithManagerEmail?: (managerEmail: string, managerAccountID?: number, shouldResolveAcknowledgedViolations?: boolean) => void;
    /**
     * Resolved by the caller's own `confirmSubmitReportViolations` call before opening the popover (iOS can't present
     * the violations modal while this popover is still open), then forwarded once the user picks a submit-to member.
     */
    shouldResolveAcknowledgedViolations?: boolean;
};

type UseReportSubmitToPopoverParams = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    anchorAlignment?: AnchorAlignment;
    /** When provided, resolves the anchor at open time (used by the shared Search host). */
    getAnchorRef?: () => RefObject<ComponentRef<typeof View> | null> | null;
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
    const {keyboardActiveHeight} = useKeyboardState();
    const {top: topSafeAreaInset} = useSafeAreaInsets();

    let submitToPopoverContentHeight;
    if (!isInLandscapeMode) {
        // Portrait uses the dedicated fixed height for this popover (`POPOVER_REPORT_SUBMIT_TO_CONTENT_HEIGHT`),
        // so the intent stays explicit rather than silently coupling to the generic dropdown max.
        submitToPopoverContentHeight = popoverDimensions.portraitHeight;
    } else {
        const contentHeightLandscapeMode = calculateModalHeightInLandscapeMode(windowHeight, topSafeAreaInset, keyboardActiveHeight);
        submitToPopoverContentHeight = Math.min(popoverDimensions.height, contentHeightLandscapeMode);
    }
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const oneShotOnSubmitSuccessRef = useRef<(() => void) | undefined>(undefined);
    const onSubmitWithManagerEmailRef = useRef<ReportSubmitToPopoverOpenOptions['onSubmitWithManagerEmail']>(undefined);
    const [shouldResolveViolationsOnOpen, setShouldResolveViolationsOnOpen] = useState<boolean | undefined>(undefined);
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
    const [ownerLogin] = usePersonalDetail(report?.ownerAccountID, loginSelector);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
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

    const submitToContentKey = `${reportID}:${getSubmitToEmail(policy, report, ownerLogin, rules)}`;

    const clearDismissGuard = () => {
        setIsDismissGuardActive(false);
        ignoreNextSearchSubmitPressRef.current = false;
    };

    const consumeIgnoreNextSearchSubmitPress = () => {
        if (!ignoreNextSearchSubmitPressRef.current) {
            return false;
        }
        clearDismissGuard();
        return true;
    };

    // Search rows must call this before any await in their press handler because the ref above resets in a microtask.
    const shouldIgnoreSearchSubmitPress = (action: SearchTransactionAction | undefined) =>
        action === CONST.SEARCH.ACTION_TYPES.SUBMIT && (isVisible || isDismissGuardActive || consumeIgnoreNextSearchSubmitPress());

    const closeReportSubmitToPopover = () => {
        canSubmitRef.current = false;
        onSubmitWithManagerEmailRef.current = undefined;
        setShouldResolveViolationsOnOpen(undefined);
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
    };

    const handleReportSubmitToPopoverModalHide = () => {
        clearDismissGuard();
    };

    const handleCombinedSubmitSuccess = () => {
        if (!canSubmitRef.current) {
            return;
        }
        const oneShot = oneShotOnSubmitSuccessRef.current;
        oneShotOnSubmitSuccessRef.current = undefined;
        onSubmitWithManagerEmailRef.current = undefined;
        setIsSearchSubmitFlow(false);
        oneShot?.();
        onSubmitSuccess?.();
    };

    const handleSearchSubmitWithManagerEmail = (managerEmail: string, managerAccountID?: number, shouldResolveAcknowledgedViolations?: boolean) => {
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
        onSubmit(managerEmail, managerAccountID, shouldResolveAcknowledgedViolations);
    };

    const showReportSubmitToPopover = (options?: ReportSubmitToPopoverOpenOptions) => {
        canSubmitRef.current = true;
        clearDismissGuard();
        oneShotOnSubmitSuccessRef.current = options?.onSubmitSuccess;
        onSubmitWithManagerEmailRef.current = options?.onSubmitWithManagerEmail;
        setShouldResolveViolationsOnOpen(options?.shouldResolveAcknowledgedViolations);
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
    };

    useEffect(() => {
        if (!reportID || willAlertModalBecomeVisible || !pendingSearchSubmitOpenOptionsRef.current) {
            return;
        }

        const pendingOptions = pendingSearchSubmitOpenOptionsRef.current;
        pendingSearchSubmitOpenOptionsRef.current = undefined;
        showReportSubmitToPopover(pendingOptions);
    }, [reportID, willAlertModalBecomeVisible, showReportSubmitToPopover]);

    const openReportSubmitToPopover = (options?: ReportSubmitToPopoverOpenOptions) => {
        if (!reportID) {
            return;
        }

        if (willAlertModalBecomeVisibleRef.current) {
            pendingSearchSubmitOpenOptionsRef.current = options;
            return;
        }

        showReportSubmitToPopover(options);
    };

    const popoverContainerStyle = isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH};

    const outerStyle = {
        ...(isSmallScreenWidth ? StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop) : {}),
        ...popoverContainerStyle,
    };

    // No height in portrait: the wrapper `View` below owns it. This container is the modal's own box, so a height set
    // here does not bound the content (the wrapper's `flex1` had nothing to resolve against, which let the content
    // overflow the fixed box and pushed the Confirm button out of view).
    const innerContainerStyle = {
        ...popoverContainerStyle,
        ...(isInLandscapeMode ? styles.getPopoverMaxHeight(windowHeight, true) : {}),
    };

    // `FixedFooter` inside the list already applies the bottom safe area on top of its own 20px, so let it
    // own that spacing entirely. Without this the narrow bottom-docked modal adds its own 16px plus a
    // second safe area inset (both helpers sum rather than max), leaving far too much room under Confirm.
    // Single owner of the popover height: this is the `flexColumn` box that directly parents the
    // content, so the height here is what bounds the chain below and lets the list scroll instead of
    // growing the popover. `flex1` is deliberately omitted, since `flex-basis: 0` would override the
    // height and hand sizing back to the content. `pt4` (wide only) is padding within that height.
    const reportSubmitToPopover = !shouldRenderSubmitToPopover ? null : (
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
            enableEdgeToEdgeBottomSafeAreaPadding
            avoidKeyboard
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <View
                collapsable={false}
                style={[StyleUtils.getHeight(submitToPopoverContentHeight), styles.flexColumn, styles.w100, !isSmallScreenWidth && styles.pt4]}
            >
                <ReportSubmitToContent
                    key={submitToContentKey}
                    report={report}
                    policy={policy}
                    isLoadingReportData={isLoadingReportData}
                    onDismiss={closeReportSubmitToPopover}
                    onSubmitSuccess={handleCombinedSubmitSuccess}
                    onSubmitWithManagerEmail={isSearchSubmitFlow ? handleSearchSubmitWithManagerEmail : undefined}
                    shouldResolveAcknowledgedViolations={shouldResolveViolationsOnOpen}
                    canSubmitRef={canSubmitRef}
                    shouldDismissRHPAfterSubmit={false}
                />
            </View>
        </PopoverWithMeasuredContent>
    );

    return {
        anchorRef,
        openReportSubmitToPopover,
        closeReportSubmitToPopover,
        isReportSubmitToPopoverVisible: isVisible,
        isReportSubmitToDismissGuardActive: isDismissGuardActive,
        shouldIgnoreSearchSubmitPress,
        reportSubmitToPopover,
    };
}

export type {ReportSubmitToPopoverOpenOptions};
export default useReportSubmitToPopover;
