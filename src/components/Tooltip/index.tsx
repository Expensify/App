import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useHover} from 'react-native-web-hooks';
import {useTheme} from '@styles/ThemeContext';
import {useThemeStyles} from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as StyleUtils from '@styles/StyleUtils';
import TooltipText from './TooltipText';
import type {TooltipProps} from './types';
import {useIsFocused} from '@hooks/useIsFocused';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';

function Tooltip({
    text,
    children,
    shiftHorizontal,
    shiftVertical,
    containerStyles,
    style,
    shouldRender,
    isDisabled,
    onHoverIn,
    onHoverOut,
    maxWidth,
    shouldUseFixedWidth,
    shouldRenderOnHover,
    ...rest
}: TooltipProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const isFocused = useIsFocused();
    const [isHovered, setIsHovered] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const tooltipRef = useRef<View>(null);
    const containerRef = useRef<View>(null);
    const [isWeb, setIsWeb] = useState(false);

    // Check if we are on web
    useEffect(() => {
        setIsWeb(DeviceCapabilities.canUseTouchScreen() === false);
    }, []);

    const {hovered, bind} = useHover({
        onMouseEnter: () => {
            if (isDisabled) {
                return;
            }
            setIsHovered(true);
            if (onHoverIn) {
                onHoverIn();
            }
        },
        onMouseLeave: () => {
            if (isDisabled) {
                return;
            }
            setIsHovered(false);
            if (onHoverOut) {
                onHoverOut();
            }
        },
    });

    // Determine if the tooltip should be rendered
    const shouldShowTooltip = () => {
        if (isDisabled) {
            return false;
        }
        if (shouldRender !== undefined) {
            return shouldRender;
        }
        // On web, we always want to show the tooltip if there is text and we are hovered
        // On mobile, we might have different logic, but the issue is specifically about Web
        if (isWeb) {
            return hovered && !!text;
        }
        return hovered && !!text;
    };

    useEffect(() => {
        if (shouldShowTooltip()) {
            setIsTooltipVisible(true);
        } else {
            setIsTooltipVisible(false);
        }
    }, [hovered, text, isDisabled, shouldRender, isWeb]);

    // If the tooltip should not be rendered, just return the children
    if (!shouldShowTooltip()) {
        return <>{children}</>;
    }

    return (
        <View
            style={[styles.tooltipContainer, containerStyles]}
            ref={containerRef}
            {...bind}
        >
            {children}
            {isTooltipVisible && (
                <View
                    ref={tooltipRef}
                    style={[
                        styles.tooltip,
                        StyleUtils.getTooltipStyle(shiftHorizontal, shiftVertical, maxWidth, shouldUseFixedWidth),
                        style,
                    ]}
                    {...rest}
                >
                    <TooltipText
                        text={text}
                        style={styles.tooltipText}
                    />
                </View>
            )}
        </View>
    );
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;