import TransparentOverlay from '@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay';
import {InteractiveTooltipActionsContext} from '@components/Tooltip/InteractiveTooltip/InteractiveTooltipContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import {Portal} from '@gorhom/portal';
import React, {useState} from 'react';
import {View} from 'react-native';

import type InteractiveTooltipPortalProps from './types';

function InteractiveTooltipPortal({
    children,
    anchorBounds,
    isPinned,
    actionsValue,
    anchorAlignment,
    maxWidth,
    shiftHorizontal = 0,
    shiftVertical = 0,
    shouldForceRenderingBelow = false,
    shouldTeleportPortalToModalLayer = false,
}: InteractiveTooltipPortalProps) {
    const {windowWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();

    const {rootWrapperStyle, pointerWrapperStyle, pointerStyle, overlayStyle} = StyleUtils.getTooltipStyles({
        tooltip: null,
        windowWidth,
        xOffset: anchorBounds.x,
        yOffset: anchorBounds.y,
        tooltipTargetWidth: anchorBounds.width,
        tooltipTargetHeight: anchorBounds.height,
        maxWidth: maxWidth ?? 0,
        tooltipContentWidth: contentMeasuredWidth,
        tooltipWrapperHeight: wrapperMeasuredHeight,
        manualShiftHorizontal: shiftHorizontal,
        manualShiftVertical: shiftVertical,
        shouldForceRenderingBelow,
        anchorAlignment,
        wrapperStyle: {},
        shouldAddHorizontalPadding: false,
        isInteractive: true,
    });

    const measureWrapperLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        setContentMeasuredWidth(width);
        setWrapperMeasuredHeight(height);
    };

    return (
        <Portal hostName={shouldTeleportPortalToModalLayer ? 'modal' : undefined}>
            {/* @gorhom/portal mounts children under PortalProvider outside InteractiveTooltip.Root, so re-provide actions here. */}
            <InteractiveTooltipActionsContext.Provider value={actionsValue}>
                {isPinned && (
                    <TransparentOverlay
                        onPress={actionsValue.closeTooltip}
                        sentryLabel={CONST.SENTRY_LABEL.TOOLTIP.OVERLAY}
                        style={overlayStyle}
                    />
                )}
                <View
                    style={rootWrapperStyle}
                    role={CONST.ROLE.TOOLTIP}
                    onLayout={measureWrapperLayout}
                >
                    <View fsClass={CONST.FULLSTORY.CLASS.UNMASK}>{children}</View>
                    <View style={pointerWrapperStyle}>
                        <View style={pointerStyle} />
                    </View>
                </View>
            </InteractiveTooltipActionsContext.Provider>
        </Portal>
    );
}

export default InteractiveTooltipPortal;
