import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {CHART_TYPE, POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext, VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import Modal from '@components/Modal';
import MultiGestureCanvas from '@components/MultiGestureCanvas';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import VictoryChartContent from './VictoryChartContent';

type VictoryChartExpandModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Called when the modal should close */
    onClose: () => void;
};

/**
 * Centered full-screen modal that presents the current chart scaled up to the viewport, with the
 * same pinch/double-tap zoom and pan gestures as the image attachment viewer.
 * Must be rendered inside a VictoryChartProvider so VictoryChartContent can read the parsed chart context.
 *
 * This mirrors the Lightbox pattern exactly: the chart is rendered ONCE at a fixed high resolution
 * (like a high-res image asset — via VictoryChartScaledProvider, which scales every pixel-space
 * value uniformly) and handed to MultiGestureCanvas at that intrinsic size. The canvas computes the
 * fit scale itself and owns the single transform for fitting, centering, and zooming — no manual
 * transforms of our own, since nested transforms rasterize the inner layer and blur it on native.
 * Zooming in reveals the native resolution, so the chart stays sharp up to the headroom factor.
 */
function VictoryChartExpandModal({isVisible, onClose}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {chartContentStyles, chartContainerStyles, type} = useVictoryChartContext();
    const [availableSize, setAvailableSize] = useState({width: 0, height: 0});
    // No pager wraps this canvas, so scrolling never needs to be handed back to one.
    const isPagerScrollEnabled = useSharedValue(false);

    const onContainerLayout = (event: LayoutChangeEvent) => {
        // Ignore layout changes while the modal is closing — re-measuring mid-animation
        // would rescale the chart and cause a visible flicker.
        if (!isVisible) {
            return;
        }
        const {width, height} = event.nativeEvent.layout;
        // Avoid re-render churn when the layout callback fires without an actual size change.
        setAvailableSize((prev) => (prev.width === width && prev.height === height ? prev : {width, height}));
    };

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasDesignDimensions = !!designWidth && !!designHeight;
    const isMeasured = availableSize.width > 0 && availableSize.height > 0;

    // Match the inline container: polar charts are clipped to hide the dead space at the
    // bottom of their design canvas, so the expanded chart centers the same way inline does.
    const isPolar = type === CHART_TYPE.POLAR;
    const effectiveDesignHeight = designHeight !== undefined && isPolar ? designHeight * POLAR_CONTAINER_HEIGHT_RATIO : designHeight;

    // Uniform scale that fits the chart's (clipped) design box inside the available modal area (may be > 1).
    const scale = hasDesignDimensions && effectiveDesignHeight !== undefined && isMeasured ? Math.min(availableSize.width / designWidth, availableSize.height / effectiveDesignHeight) : 1;

    // The fitted (displayed) size of the chart inside the modal.
    const targetWidth = (designWidth ?? 0) * scale;
    const targetHeight = (designHeight ?? 0) * scale;
    const clippedTargetHeight = (effectiveDesignHeight ?? 0) * scale;

    // The chart's intrinsic render size: drawn larger than the fitted size (like a 2x image asset)
    // so that pinch-zooming reveals native resolution instead of magnified raster pixels.
    // Capped so the canvas never exceeds a safe texture size.
    const MAX_CANVAS_DIMENSION = 2048;
    // 2x headroom covers typical pinch-zoom depth without paying for a larger render surface.
    const MAX_ZOOM_HEADROOM = 2;
    const zoomHeadroom = Math.max(1, Math.min(MAX_ZOOM_HEADROOM, MAX_CANVAS_DIMENSION / Math.max(targetWidth, targetHeight, 1)));
    const renderWidth = targetWidth * zoomHeadroom;
    const renderHeight = targetHeight * zoomHeadroom;
    const clippedRenderHeight = clippedTargetHeight * zoomHeadroom;

    // Visual styles parsed from the chart HTML — resolved and applied the same way
    // VictoryChartContainerFixed does inline, so the expanded chart keeps the same
    // (theme-aware) background and rounding.
    const backgroundColor = resolveChartContainerBgColor(chartContainerStyles.backgroundColor, theme);
    const borderRadius = chartContainerStyles.borderRadius;

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            {/* Explicitly paint the modal surface: during the close animation the unpainted modal base
                can flash through as white, which is clearly visible on dark themes. */}
            <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.appBG)]}>
                {/* Header matches the attachment modal: back button on narrow layouts, close button on the right otherwise. */}
                <HeaderWithBackButton
                    title={translate('common.details')}
                    shouldShowBorderBottom
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldShowCloseButton={!shouldUseNarrowLayout}
                    onBackButtonPress={onClose}
                    onCloseButtonPress={onClose}
                />
                {/* Padding lives on the outer view; the inner view is measured so the fit scale never
                exceeds the actual content area and the side gutters are preserved. */}
                <View style={[styles.flex1, styles.ph5]}>
                    <View
                        style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}
                        onLayout={onContainerLayout}
                    >
                        {isMeasured &&
                            (hasDesignDimensions && effectiveDesignHeight !== undefined ? (
                                // Pinch/double-tap zoom and pan, matching the image attachment viewer. The canvas
                                // receives the chart at its intrinsic (high-res) size and fits it itself.
                                <MultiGestureCanvas
                                    isActive={isVisible}
                                    canvasSize={availableSize}
                                    contentSize={{width: renderWidth, height: clippedRenderHeight}}
                                    isUsedInCarousel={false}
                                    isPagerScrollEnabled={isPagerScrollEnabled}
                                >
                                    {/* Clip the container (not the content) so polar dead space is hidden while the chart renders at full fidelity. */}
                                    <View
                                        style={[
                                            StyleUtils.getWidthAndHeightStyle(renderWidth, clippedRenderHeight),
                                            typeof borderRadius === 'number' && isPolar && StyleUtils.getBorderRadiusStyle(borderRadius),
                                            styles.overflowHidden,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                StyleUtils.getWidthAndHeightStyle(renderWidth, renderHeight),
                                                backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(backgroundColor),
                                                typeof borderRadius === 'number' && StyleUtils.getBorderRadiusStyle(borderRadius),
                                                styles.overflowHidden,
                                            ]}
                                        >
                                            {/* The Skia canvas is removed as soon as closing starts: WebGL canvases can
                                            flash white when re-composited during the close animation (visible on dark
                                            themes). The card box stays so the modal animates out looking intact. */}
                                            {isVisible && (
                                                <VictoryChartScaledProvider scale={scale * zoomHeadroom}>
                                                    <VictoryChartContent
                                                        explicitSize={{width: renderWidth, height: renderHeight}}
                                                        headless={false}
                                                    />
                                                </VictoryChartScaledProvider>
                                            )}
                                        </View>
                                    </View>
                                </MultiGestureCanvas>
                            ) : (
                                // Charts without design dimensions have no design-based label coordinates, so fluid
                                // rendering is safe. Background/rounding are still applied so the expanded chart
                                // keeps the same themed container the inline fluid path renders with.
                                <View
                                    style={[
                                        styles.w100,
                                        styles.flex1,
                                        backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(backgroundColor),
                                        typeof borderRadius === 'number' && StyleUtils.getBorderRadiusStyle(borderRadius),
                                        styles.overflowHidden,
                                    ]}
                                >
                                    {isVisible && <VictoryChartContent />}
                                </View>
                            ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

VictoryChartExpandModal.displayName = 'VictoryChartExpandModal';

export default VictoryChartExpandModal;
