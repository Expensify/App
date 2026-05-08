import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import type {ReactNode, RefObject} from 'react';
import React, {useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

    popoverWidth?: number;

    /** The component to render in the popover */
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;

    /** The component to render as the button */
    ButtonComponent: React.ComponentType<ButtonComponentProps>;

    /** Wrapper style for the outer view */
    wrapperStyle?: StyleProp<ViewStyle>;

    smallScreenModalType?: PopoverWithMeasuredContentProps['smallScreenModalType'];
};

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function FilterPopupButton({viewportOffsetTop, popoverWidth, PopoverComponent, ButtonComponent, wrapperStyle, smallScreenModalType}: FilterPopupButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

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

    /**
     * Toggle the overlay between open & closed
     */
    const toggleOverlay = () => {
        setIsOverlayVisible((previousValue) => {
            if (!previousValue && willAlertModalBecomeVisible) {
                return false;
            }

            return !previousValue;
        });
    };

    /**
     * Calculate popover position and toggle overlay
     */
    const calculatePopoverPositionAndToggleOverlay = () => {
        calculatePopoverPosition(anchorRef, ANCHOR_ORIGIN).then((pos) => {
            setPopoverTriggerPosition({...pos, vertical: pos.vertical});
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
            <ButtonComponent
                ref={triggerRef}
                onPress={calculatePopoverPositionAndToggleOverlay}
                isExpanded={isOverlayVisible}
            />

            {/* Dropdown overlay */}
            <PopoverWithMeasuredContent
                smallScreenModalType={smallScreenModalType}
                anchorRef={triggerRef}
                avoidKeyboard
                isVisible={isOverlayVisible}
                onClose={toggleOverlay}
                anchorPosition={popoverTriggerPosition}
                anchorAlignment={ANCHOR_ORIGIN}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldEnableNewFocusManagement
                shouldMeasureAnchorPositionFromTop={false}
                outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...containerStyles}}
                // This must be false because we dont want the modal to close if we open the RHP for selections
                // such as date years
                shouldCloseWhenBrowserNavigationChanged={false}
                innerContainerStyle={{...containerStyles, ...styles.p0, flex: 1}}
                popoverDimensions={{
                    width: 0,
                    height: CONST.POPOVER_DROPDOWN_MIN_HEIGHT,
                }}
                shouldSkipRemeasurement
                shouldDisplayBelowModals
                shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
            >
                {popoverContent}
            </PopoverWithMeasuredContent>
        </View>
    );
}

export type {PopoverComponentProps, FilterPopupButtonProps};
export default withViewportOffsetTop(FilterPopupButton);
