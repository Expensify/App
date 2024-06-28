import type {Animated, StyleProp, TextStyle, View, ViewStyle} from 'react-native';

type TooltipStyles = {
    animationStyle: ViewStyle;
    rootWrapperStyle: ViewStyle;
    textStyle: TextStyle;
    pointerWrapperStyle: ViewStyle;
    pointerStyle: ViewStyle;
};

type TooltipParams = {
    tooltip: View | HTMLDivElement | null;
    currentSize: Animated.Value;
    windowWidth: number;
    xOffset: number;
    yOffset: number;
    tooltipTargetWidth: number;
    tooltipTargetHeight: number;
    maxWidth: number;
    tooltipContentWidth?: number;
    tooltipWrapperHeight?: number;
    manualShiftHorizontal?: number;
    manualShiftVertical?: number;
    shouldForceRenderingBelow?: boolean;
    shouldForceRenderingLeft?: boolean;
    wrapperStyle: StyleProp<ViewStyle>;
};

type GetTooltipStylesStyleUtil = {getTooltipStyles: (props: TooltipParams) => TooltipStyles};

export type {TooltipStyles, TooltipParams, GetTooltipStylesStyleUtil};
