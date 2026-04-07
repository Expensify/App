import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import type {ComponentProps, ReactNode, Ref} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import Text from '@components/Text';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPlatform from '@libs/getPlatform';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

type ModalHeadingNode = ComponentProps<typeof Text> extends {ref?: Ref<infer T>} ? T | null : never;
type ModalHeadingRef = (node: ModalHeadingNode) => void;

type PopoverComponentProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    setPopoverWidth?: (width: number | undefined) => void;
    modalHeadingRef?: ModalHeadingRef;
};

type DropdownButtonProps = WithSentryLabel & {
    /** The label to display on the select */
    label: string;

    /** The selected value(s) if any */
    value: string | string[] | null;

    /** The viewport's offset */
    viewportOffsetTop: number;

    /** The component to render in the popover */
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;

    /** Whether to use medium size button instead of small */
    medium?: boolean;

    /** Button inner styles */
    innerStyles?: StyleProp<ViewStyle>;

    /** Button label style */
    labelStyle?: StyleProp<TextStyle>;

    /** Caret wrapper style */
    caretWrapperStyle?: StyleProp<ViewStyle>;

    /** Wrapper style for the outer view */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Internal opt-in to delay dismiss accessibility for bottom-docked filter popovers */
    shouldDelayBottomDockedDismissAccessibility?: boolean;
};

const PADDING_MODAL = 8;
const BOTTOM_DOCKED_DISMISS_ACCESSIBILITY_DELAY = 2500;

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function DropdownButton({
    label,
    value,
    viewportOffsetTop,
    PopoverComponent,
    medium = false,
    labelStyle,
    innerStyles,
    caretWrapperStyle,
    wrapperStyle,
    sentryLabel,
    shouldDelayBottomDockedDismissAccessibility = false,
}: DropdownButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const triggerRef = useRef<View | null>(null);
    const anchorRef = useRef<View | null>(null);
    const modalAccessibilityHeadingElementRef = useRef<ModalHeadingNode>(null);
    const dismissAccessibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [shouldEnableBottomDockedDismissAccessibility, setShouldEnableBottomDockedDismissAccessibility] = useState(true);
    const [customPopoverWidth, setCustomPopoverWidth] = useState<number | undefined>(undefined);
    const {calculatePopoverPosition} = usePopoverPosition();

    const [popoverTriggerPosition, setPopoverTriggerPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {selector: willAlertModalBecomeVisibleSelector});
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const shouldUseWebModalHeadingFocus = shouldDelayBottomDockedDismissAccessibility && isSmallScreenWidth && isWeb;
    const shouldDelayDismissAccessibilityForCurrentLayout = shouldDelayBottomDockedDismissAccessibility && isSmallScreenWidth && !isWeb;

    const handleModalHeadingRef = useCallback<ModalHeadingRef>((node) => {
        modalAccessibilityHeadingElementRef.current = node;
    }, []);

    /**
     * Toggle the overlay between open & closed
     */
    const toggleOverlay = useCallback(() => {
        setIsOverlayVisible((previousValue) => {
            if (!previousValue && willAlertModalBecomeVisible) {
                return false;
            }

            return !previousValue;
        });
    }, [willAlertModalBecomeVisible]);

    /**
     * Calculate popover position and toggle overlay
     */
    const calculatePopoverPositionAndToggleOverlay = useCallback(() => {
        calculatePopoverPosition(anchorRef, ANCHOR_ORIGIN).then((pos) => {
            setPopoverTriggerPosition({...pos, vertical: pos.vertical + PADDING_MODAL});
            toggleOverlay();
        });
    }, [calculatePopoverPosition, toggleOverlay]);
    /**
     * When no items are selected, render the label, otherwise, render the
     * list of selected items as well
     */
    const buttonText = useMemo(() => {
        if (!value?.length) {
            return label;
        }

        const selectedItems = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${selectedItems}`;
    }, [label, value]);

    const actualPopoverWidth = customPopoverWidth ?? CONST.POPOVER_DROPDOWN_WIDTH;

    const containerStyles = useMemo(() => {
        if (isSmallScreenWidth) {
            return styles.w100;
        }
        return {width: actualPopoverWidth};
    }, [isSmallScreenWidth, styles, actualPopoverWidth]);

    const popoverContent = useMemo(() => {
        return PopoverComponent({
            closeOverlay: toggleOverlay,
            isExpanded: isOverlayVisible,
            setPopoverWidth: setCustomPopoverWidth,
            modalHeadingRef: shouldUseWebModalHeadingFocus ? handleModalHeadingRef : undefined,
        });
    }, [PopoverComponent, toggleOverlay, isOverlayVisible, shouldUseWebModalHeadingFocus, handleModalHeadingRef]);

    const initialFocus = shouldUseWebModalHeadingFocus ? () => modalAccessibilityHeadingElementRef.current as never : undefined;

    const clearDismissAccessibilityTimeout = useCallback(() => {
        if (!dismissAccessibilityTimeoutRef.current) {
            return;
        }

        clearTimeout(dismissAccessibilityTimeoutRef.current);
        dismissAccessibilityTimeoutRef.current = null;
    }, []);

    const handleModalShow = useCallback(() => {
        if (!shouldDelayDismissAccessibilityForCurrentLayout) {
            return;
        }

        clearDismissAccessibilityTimeout();
        setShouldEnableBottomDockedDismissAccessibility(false);
        dismissAccessibilityTimeoutRef.current = setTimeout(() => {
            setShouldEnableBottomDockedDismissAccessibility(true);
            dismissAccessibilityTimeoutRef.current = null;
        }, BOTTOM_DOCKED_DISMISS_ACCESSIBILITY_DELAY);
    }, [clearDismissAccessibilityTimeout, shouldDelayDismissAccessibilityForCurrentLayout]);

    useEffect(() => {
        if (!shouldDelayDismissAccessibilityForCurrentLayout) {
            setShouldEnableBottomDockedDismissAccessibility(true);
            return;
        }

        if (isOverlayVisible) {
            return;
        }

        clearDismissAccessibilityTimeout();
        setShouldEnableBottomDockedDismissAccessibility(false);
    }, [clearDismissAccessibilityTimeout, isOverlayVisible, shouldDelayDismissAccessibilityForCurrentLayout]);

    useEffect(
        () => () => {
            clearDismissAccessibilityTimeout();
        },
        [clearDismissAccessibilityTimeout],
    );

    return (
        <View
            ref={anchorRef}
            style={wrapperStyle}
        >
            {/* Dropdown Trigger */}
            <Button
                ref={triggerRef}
                innerStyles={[isOverlayVisible && styles.buttonHoveredBG, {maxWidth: 256}, innerStyles]}
                onPress={calculatePopoverPositionAndToggleOverlay}
                sentryLabel={sentryLabel}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(medium ? {medium: true} : {small: true})}
            >
                <CaretWrapper
                    style={[styles.flex1, styles.mw100, caretWrapperStyle]}
                    caretWidth={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                    caretHeight={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                    isActive={isOverlayVisible}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroBold, styles.flexShrink1, labelStyle]}
                    >
                        {buttonText}
                    </Text>
                </CaretWrapper>
            </Button>

            {/* Dropdown overlay */}
            <PopoverWithMeasuredContent
                anchorRef={triggerRef}
                avoidKeyboard
                isVisible={isOverlayVisible}
                onModalShow={handleModalShow}
                onClose={toggleOverlay}
                anchorPosition={popoverTriggerPosition}
                anchorAlignment={ANCHOR_ORIGIN}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldEnableNewFocusManagement
                shouldEnableBottomDockedDismissAccessibility={shouldDelayDismissAccessibilityForCurrentLayout ? shouldEnableBottomDockedDismissAccessibility : undefined}
                initialFocus={initialFocus}
                shouldMeasureAnchorPositionFromTop={false}
                outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...containerStyles}}
                // This must be false because we dont want the modal to close if we open the RHP for selections
                // such as date years
                shouldCloseWhenBrowserNavigationChanged={false}
                innerContainerStyle={containerStyles}
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
        </View>
    );
}

export type {PopoverComponentProps, DropdownButtonProps, ModalHeadingRef};
export default withViewportOffsetTop(DropdownButton);
