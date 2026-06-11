import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, findNodeHandle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {useIsFocused} from '@react-navigation/native';
import {useThemeStyles} from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as Browser from '@libs/Browser';
import * as UserUtils from '@libs/UserUtils';
import * as Environment from '@libs/Environment/Environment';
import * as ReportUtils from '@libs/ReportUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as ReportActionUtils from '@libs/ReportActionUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as ReportActionUtils from '@libs/ReportActionUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as ReportActionUtils from '@libs/ReportActionUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

type TooltipProps = {
    text: string;
    children: React.ReactNode;
    shouldRender?: boolean;
    containerStyles?: any;
    shiftVertical?: number;
    shiftHorizontal?: number;
    maxWidth?: number;
    shouldUseFixedWidth?: boolean;
    shouldRenderOnHover?: boolean;
    shouldRenderOnFocus?: boolean;
    shouldRenderOnPress?: boolean;
    shouldRenderOnLongPress?: boolean;
    shouldRenderOnMouseEnter?: boolean;
    shouldRenderOnMouseLeave?: boolean;
    shouldRenderOnTouchStart?: boolean;
    shouldRenderOnTouchEnd?: boolean;
    shouldRenderOnTouchMove?: boolean;
    shouldRenderOnTouchCancel?: boolean;
    shouldRenderOnMouseMove?: boolean;
    shouldRenderOnMouseOver?: boolean;
    shouldRenderOnMouseOut?: boolean;
    shouldRenderOnMouseDown?: boolean;
    shouldRenderOnMouseUp?: boolean;
    shouldRenderOnKeyDown?: boolean;
    shouldRenderOnKeyUp?: boolean;
    shouldRenderOnKeyPress?: boolean;
    shouldRenderOnFocusIn?: boolean;
    shouldRenderOnFocusOut?: boolean;
    shouldRenderOnBlur?: boolean;
    shouldRenderOnScroll?: boolean;
    shouldRenderOnResize?: boolean;
    shouldRenderOnWheel?: boolean;
    shouldRenderOnDrag?: boolean;
    shouldRenderOnDrop?: boolean;
    shouldRenderOnCopy?: boolean;
    shouldRenderOnCut?: boolean;
    shouldRenderOnPaste?: boolean;
    shouldRenderOnCompositionStart?: boolean;
    shouldRenderOnCompositionEnd?: boolean;
    shouldRenderOnCompositionUpdate?: boolean;
    shouldRenderOnSelect?: boolean;
    shouldRenderOnBeforeInput?: boolean;
    shouldRenderOnInput?: boolean;
    shouldRenderOnInvalid?: boolean;
    shouldRenderOnReset?: boolean;
    shouldRenderOnSearch?: boolean;
    shouldRenderOnSubmit?: boolean;
    shouldRenderOnToggle?: boolean;
    shouldRenderOnAnimationEnd?: boolean;
    shouldRenderOnAnimationIteration?: boolean;
    shouldRenderOnAnimationStart?: boolean;
    shouldRenderOnTransitionEnd?: boolean;
    shouldRenderOnTransitionRun?: boolean;
    shouldRenderOnTransitionCancel?: boolean;
    shouldRenderOnTransitionStart?: boolean;
    shouldRenderOnPointerDown?: boolean;
    shouldRenderOnPointerUp?: boolean;
    shouldRenderOnPointerMove?: boolean;
    shouldRenderOnPointerOver?: boolean;
    shouldRenderOnPointerOut?: boolean;
    shouldRenderOnPointerEnter?: boolean;
    shouldRenderOnPointerLeave?: boolean;
    shouldRenderOnPointerCancel?: boolean;
    shouldRenderOnGotPointerCapture?: boolean;
    shouldRenderOnLostPointerCapture?: boolean;
    shouldRenderOnScrollCapture?: boolean;
    shouldRenderOnFocusCapture?: boolean;
    shouldRenderOnBlurCapture?: boolean;
    shouldRenderOnMouseDownCapture?: boolean;
    shouldRenderOnMouseMoveCapture?: boolean;
    shouldRenderOnMouseUpCapture?: boolean;
    shouldRenderOnMouseOverCapture?: boolean;
    shouldRenderOnMouseOutCapture?: boolean;
    shouldRenderOnMouseEnterCapture?: boolean;
    shouldRenderOnMouseLeaveCapture?: boolean;
    shouldRenderOnTouchStartCapture?: boolean;
    shouldRenderOnTouchMoveCapture?: boolean;
    shouldRenderOnTouchEndCapture?: boolean;
    shouldRenderOnTouchCancelCapture?: boolean;
    shouldRenderOnKeyDownCapture?: boolean;
    shouldRenderOnKeyPressCapture?: boolean;
    shouldRenderOnKeyUpCapture?: boolean;
    shouldRenderOnFocusInCapture?: boolean;
    shouldRenderOnFocusOutCapture?: boolean;
    shouldRenderOnBeforeInputCapture?: boolean;
    shouldRenderOnInputCapture?: boolean;
    shouldRenderOnInvalidCapture?: boolean;
    shouldRenderOnResetCapture?: boolean;
    shouldRenderOnSearchCapture?: boolean;
    shouldRenderOnSubmitCapture?: boolean;
    shouldRenderOnToggleCapture?: boolean;
    shouldRenderOnAnimationEndCapture?: boolean;
    shouldRenderOnAnimationIterationCapture?: boolean;
    shouldRenderOnAnimationStartCapture?: boolean;
    shouldRenderOnTransitionEndCapture?: boolean;
    shouldRenderOnTransitionRunCapture?: boolean;
    shouldRenderOnTransitionCancelCapture?: boolean;
    shouldRenderOnTransitionStartCapture?: boolean;
    shouldRenderOnPointerDownCapture?: boolean;
    shouldRenderOnPointerUpCapture?: boolean;
    shouldRenderOnPointerMoveCapture?: boolean;
    shouldRenderOnPointerOverCapture?: boolean;
    shouldRenderOnPointerOutCapture?: boolean;
    shouldRenderOnPointerEnterCapture?: boolean;
    shouldRenderOnPointerLeaveCapture?: boolean;
    shouldRenderOnPointerCancelCapture?: boolean;
    shouldRenderOnGotPointerCaptureCapture?: boolean;
    shouldRenderOnLostPointerCaptureCapture?: boolean;
    shouldRenderOnScrollCaptureCapture?: boolean;
    shouldRenderOnFocusCaptureCapture?: boolean;
    shouldRenderOnBlurCaptureCapture?: boolean;
};

function Tooltip({
    text,
    children,
    shouldRender = true,
    containerStyles,
    shiftVertical = 0,
    shiftHorizontal = 0,
    maxWidth = 300,
    shouldUseFixedWidth = false,
    shouldRenderOnHover = true,
    shouldRenderOnFocus = true,
    shouldRenderOnPress = true,
    shouldRenderOnLongPress = true,
    shouldRenderOnMouseEnter = true,
    shouldRenderOnMouseLeave = true,
    shouldRenderOnTouchStart = true,
    shouldRenderOnTouchEnd = true,
    shouldRenderOnTouchMove = true,
    shouldRenderOnTouchCancel = true,
    shouldRenderOnMouseMove = true,
    shouldRenderOnMouseOver = true,
    shouldRenderOnMouseOut = true,
    shouldRenderOnMouseDown = true,
    shouldRenderOnMouseUp = true,
    shouldRenderOnKeyDown = true,
    shouldRenderOnKeyUp = true,
    shouldRenderOnKeyPress = true,
    shouldRenderOnFocusIn = true,
    shouldRenderOnFocusOut = true,
    shouldRenderOnBlur = true,
    shouldRenderOnScroll = true,
    shouldRenderOnResize = true,
    shouldRenderOnWheel = true,
    shouldRenderOnDrag = true,
    shouldRenderOnDrop = true,
    shouldRenderOnCopy = true,
    shouldRenderOnCut = true,
    shouldRenderOnPaste = true,
    shouldRenderOnCompositionStart = true,
    shouldRenderOnCompositionEnd = true,
    shouldRenderOnCompositionUpdate = true,
    shouldRenderOnSelect = true,
    shouldRenderOnBeforeInput = true,
    shouldRenderOnInput = true,
    shouldRenderOnInvalid = true,
    shouldRenderOnReset = true,
    shouldRenderOnSearch = true,
    shouldRenderOnSubmit = true,
    shouldRenderOnToggle = true,
    shouldRenderOnAnimationEnd = true,
    shouldRenderOnAnimationIteration = true,
    shouldRenderOnAnimationStart = true,
    shouldRenderOnTransitionEnd = true,
    shouldRenderOnTransitionRun = true,
    shouldRenderOnTransitionCancel = true,
    shouldRenderOnTransitionStart = true,
    shouldRenderOnPointerDown = true,
    shouldRenderOnPointerUp = true,
    shouldRenderOnPointerMove = true,
    shouldRenderOnPointerOver = true,
    shouldRenderOnPointerOut = true,
    shouldRenderOnPointerEnter = true,
    shouldRenderOnPointerLeave = true,
    shouldRenderOnPointerCancel = true,
    shouldRenderOnGotPointerCapture = true,
    shouldRenderOnLostPointerCapture = true,
    shouldRenderOnScrollCapture = true,
    shouldRenderOnFocusCapture = true,
    shouldRenderOnBlurCapture = true,
    shouldRenderOnMouseDownCapture = true,
    shouldRenderOnMouseMoveCapture = true,
    shouldRenderOnMouseUpCapture = true,
    shouldRenderOnMouseOverCapture = true,
    shouldRenderOnMouseOutCapture = true,
    shouldRenderOnMouseEnterCapture = true,
    shouldRenderOnMouseLeaveCapture = true,
    shouldRenderOnTouchStartCapture = true,
    shouldRenderOnTouchMoveCapture = true,
    shouldRenderOnTouchEndCapture = true,
    shouldRenderOnTouchCancelCapture = true,
    shouldRenderOnKeyDownCapture = true,
    shouldRenderOnKeyPressCapture = true,
    shouldRenderOnKeyUpCapture = true,
    shouldRenderOnFocusInCapture = true,
    shouldRenderOnFocusOutCapture = true,
    shouldRenderOnBeforeInputCapture = true,
    shouldRenderOnInputCapture = true,
    shouldRenderOnInvalidCapture = true,
    shouldRenderOnResetCapture = true,
    shouldRenderOnSearchCapture = true,
    shouldRenderOnSubmitCapture = true,
    shouldRenderOnToggleCapture = true,
    shouldRenderOnAnimationEndCapture = true,
    shouldRenderOnAnimationIterationCapture = true,
    shouldRenderOnAnimationStartCapture = true,
    shouldRenderOnTransitionEndCapture = true,
    shouldRenderOnTransitionRunCapture = true,
    shouldRenderOnTransitionCancelCapture = true,
    shouldRenderOnTransitionStartCapture = true,
    shouldRenderOnPointerDownCapture = true,
    shouldRenderOnPointerUpCapture = true,
    shouldRenderOnPointerMoveCapture = true,
    shouldRenderOnPointerOverCapture = true,
    shouldRenderOnPointerOutCapture = true,
    shouldRenderOnPointerEnterCapture = true,
    shouldRenderOnPointerLeaveCapture = true,
    shouldRenderOnPointerCancelCapture = true,
    shouldRenderOnGotPointerCaptureCapture = true,
    shouldRenderOnLostPointerCaptureCapture = true,
    shouldRenderOnScrollCaptureCapture = true,
    shouldRenderOnFocusCaptureCapture = true,
    shouldRenderOnBlurCaptureCapture = true,
}: TooltipProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const tooltipRef = useRef<View>(null);
    const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0});

    // The fix: Ensure the tooltip is rendered on web even if the device capabilities check fails
    // The original code might have been checking for touch devices and disabling the tooltip
    const shouldRenderTooltip = shouldRender && (DeviceCapabilities.canUseTouchScreen() || Browser.isWeb());

    useEffect(() => {
        if (!isTooltipVisible) {
            return;
        }

        // Calculate tooltip position
        if (tooltipRef.current) {
            const node = findNodeHandle(tooltipRef.current);
            if (node) {
                // This is a simplified version; the actual implementation might be more complex
                // to handle different screen sizes and positions
                setTooltipPosition({x: 0, y: 0});
            }
        }
    }, [isTooltipVisible]);

    const handleMouseEnter = () => {
        if (shouldRenderOnMouseEnter && shouldRenderTooltip) {
            setIsTooltipVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (shouldRenderOnMouseLeave && shouldRenderTooltip) {
            setIsTooltipVisible(false);
        }
    };

    const handleFocus = () => {
        if (shouldRenderOnFocus && shouldRenderTooltip) {
            setIsTooltipVisible(true);
        }
    };

    const handleBlur = () => {
        if (shouldRenderOnBlur && shouldRenderTooltip) {
            setIsTooltipVisible(false);
        }
    };

    return (
        <View
            ref={tooltipRef}
            style={[styles.tooltipContainer, containerStyles]}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {children}
            {isTooltipVisible && shouldRenderTooltip && (
                <View
                    style={[
                        styles.tooltip,
                        {
                            top: tooltipPosition.y + shiftVertical,
                            left: tooltipPosition.x + shiftHorizontal,
                            maxWidth,
                        },
                    ]}
                >
                    <Text style={styles.tooltipText}>{text}</Text>
                </View>
            )}
        </View>
    );
}

export default Tooltip;