import {useIsFocused} from '@react-navigation/core';
import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import type {ReactNode, RefObject} from 'react';
import React, {useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useIsYearSelectorOpen from '@components/DatePicker/useIsYearSelectorOpen';
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
};

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function FilterPopupButton({viewportOffsetTop, popoverWidth, wrapperStyle, popoverAnchorAlignment: popoverAnchorAlignmentProp, PopoverComponent, renderButton}: FilterPopupButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHP and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();
    // While the year-selector RHP is open the popover stays mounted across the blur (its render is gated on the
    // user-controlled isOverlayVisible, not navigation focus) so its state survives the round-trip. The
    // CalendarPicker inside asks the popover's modal to hide in place via HiddenForOverlayContext — this host
    // only has to keep it mounted and ignore the selector's goBack (see toggleOverlay).
    const isYearSelectorOpen = useIsYearSelectorOpen();
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

    const toggleOverlay = () => {
        // The year-selector RHP's goBack fires this popover's onClose; ignore it while the year selector is open
        // so the popover stays mounted and its CalendarPicker is there to consume/apply the picked year on return.
        if (isYearSelectorOpen) {
            return;
        }
        setIsOverlayVisible((previousValue) => {
            if (!previousValue && willAlertModalBecomeVisible) {
                return false;
            }

            return !previousValue;
        });
    };

    const calculatePopoverPositionAndToggleOverlay = () => {
        calculatePopoverPosition(anchorRef, popoverAnchorAlignment).then((position) => {
            setPopoverTriggerPosition({...position, vertical: position.vertical});
            toggleOverlay();
        });
    };

    const actualPopoverWidth = customPopoverWidth ?? popoverWidth ?? CONST.POPOVER_DROPDOWN_WIDTH;
    const containerStyles = isSmallScreenWidth ? styles.w100 : {width: actualPopoverWidth};

    const popoverContent = PopoverComponent({closeOverlay: toggleOverlay, isExpanded: isOverlayVisible, setPopoverWidth: setCustomPopoverWidth});

    return (
        <View
            ref={anchorRef}
            style={wrapperStyle}
        >
            {/* Dropdown Trigger */}
            {renderButton({ref: triggerRef, onPress: calculatePopoverPositionAndToggleOverlay, isExpanded: isOverlayVisible})}

            {/* Dropdown overlay — keep mounted while the user has it open (isOverlayVisible), not while the
                screen is focused, so opening the year-selector RHP (which blurs the screen) doesn't unmount it */}
            {(isFocused || isOverlayVisible) && (
                <PopoverWithMeasuredContent
                    anchorRef={triggerRef}
                    avoidKeyboard
                    isVisible={isOverlayVisible}
                    onClose={toggleOverlay}
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
