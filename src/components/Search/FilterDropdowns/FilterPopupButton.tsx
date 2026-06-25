import {useIsFocused} from '@react-navigation/core';
import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import type {ReactNode, RefObject} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

type PopoverComponentProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    setPopoverWidth?: (width: number | undefined) => void;
};

type ButtonComponentProps = {
    onPress: () => void;
    ref: RefObject<View | null>;
    isExpanded: boolean;
};

type FilterPopupButtonProps = {
    /** The viewport's offset */
    viewportOffsetTop: number;

    /** Wrapper style for the outer view */
    wrapperStyle?: StyleProp<ViewStyle>;

    popoverWidth?: number;
    popoverAnchorAlignment?: AnchorAlignment;

    /** The component to render in the popover */
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;

    /** The component to render as the button */
    renderButton: (props: ButtonComponentProps) => ReactNode;

    /** Each new value of this token auto-opens the popover (used by the saved-view "Edit filters" flow triggered from the LHN) */
    autoExpandToken?: number;

    /** Called whenever the popover closes (click-outside, Cancel or Save) so the caller can leave any associated edit mode */
    onOverlayClose?: () => void;
};

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function FilterPopupButton({
    viewportOffsetTop,
    popoverWidth,
    wrapperStyle,
    popoverAnchorAlignment: popoverAnchorAlignmentProp,
    PopoverComponent,
    renderButton,
    autoExpandToken,
    onOverlayClose,
}: FilterPopupButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHP and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const triggerRef = useRef<View | null>(null);
    const anchorRef = useRef<View | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [customPopoverWidth, setCustomPopoverWidth] = useState<number | undefined>(undefined);
    const {calculatePopoverPosition} = usePopoverPosition();

    const [popoverTriggerPosition, setPopoverTriggerPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {selector: willAlertModalBecomeVisibleSelector});

    const popoverAnchorAlignment = popoverAnchorAlignmentProp ?? ANCHOR_ORIGIN;

    const openOverlay = (shouldBypassAlertModalCheck = false) => {
        if (willAlertModalBecomeVisible && !shouldBypassAlertModalCheck) {
            return;
        }
        calculatePopoverPosition(anchorRef, popoverAnchorAlignment).then((position) => {
            setPopoverTriggerPosition({...position, vertical: position.vertical});
            setIsOverlayVisible(true);
        });
    };

    const closeOverlay = () => {
        setIsOverlayVisible(false);
        onOverlayClose?.();
    };

    const toggleOverlay = () => {
        if (isOverlayVisible) {
            closeOverlay();
            return;
        }
        openOverlay();
    };

    // Auto-open the popover for each new autoExpandToken (e.g. every saved-view "Edit filters" click from the LHN).
    // Keying off the token's value (not a boolean) makes every click re-open reliably, even for the same view that was
    // just edited and closed, and is immune to Onyx de-duping or the header button remounting on navigation.
    const lastAutoExpandTokenRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (autoExpandToken === undefined) {
            lastAutoExpandTokenRef.current = undefined;
            return;
        }
        // Skip (and let this effect retry when a dependency changes) while the popover is already open or the screen
        // isn't focused yet (mid-navigation). We deliberately open even while a modal is transitioning
        // (willAlertModalBecomeVisible, e.g. the LHN 3-dot menu closing) by bypassing that guard in openOverlay —
        // otherwise the popover would wait for the transition to settle, which is slow when the new search is loading.
        if (lastAutoExpandTokenRef.current === autoExpandToken || isOverlayVisible || !isFocused) {
            return;
        }
        lastAutoExpandTokenRef.current = autoExpandToken;
        openOverlay(true);
        // openOverlay is intentionally omitted: it is re-created every render and including it would re-run this effect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoExpandToken, isFocused, isOverlayVisible]);

    const actualPopoverWidth = customPopoverWidth ?? popoverWidth ?? CONST.POPOVER_DROPDOWN_WIDTH;
    const containerStyles = isSmallScreenWidth ? styles.w100 : {width: actualPopoverWidth};

    const popoverContent = PopoverComponent({closeOverlay, isExpanded: isOverlayVisible, setPopoverWidth: setCustomPopoverWidth});

    return (
        <View
            ref={anchorRef}
            style={wrapperStyle}
        >
            {/* Dropdown Trigger */}
            {renderButton({ref: triggerRef, onPress: toggleOverlay, isExpanded: isOverlayVisible})}

            {/* Dropdown overlay */}
            {isFocused && (
                <PopoverWithMeasuredContent
                    anchorRef={triggerRef}
                    avoidKeyboard
                    isVisible={isOverlayVisible}
                    onClose={closeOverlay}
                    anchorPosition={popoverTriggerPosition}
                    anchorAlignment={popoverAnchorAlignment}
                    restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                    shouldEnableNewFocusManagement
                    shouldMeasureAnchorPositionFromTop={false}
                    outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...containerStyles}}
                    // This must be false because we dont want the modal to close if we open the RHP for selections
                    // such as date years
                    shouldCloseWhenBrowserNavigationChanged={false}
                    innerContainerStyle={{...containerStyles, ...styles.p0}}
                    popoverDimensions={{
                        width: actualPopoverWidth,
                        height: CONST.POPOVER_DROPDOWN_MIN_HEIGHT,
                    }}
                    shouldSkipRemeasurement
                    shouldDisplayBelowModals
                    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
                >
                    {popoverContent}
                </PopoverWithMeasuredContent>
            )}
        </View>
    );
}

export type {PopoverComponentProps, ButtonComponentProps, FilterPopupButtonProps};
export default withViewportOffsetTop(FilterPopupButton);
