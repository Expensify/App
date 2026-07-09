import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {CHART_TYPE, POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import Modal from '@components/Modal';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import VictoryChartContent from './VictoryChartContent';

type VictoryChartExpandModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Called when the modal should close */
    onClose: () => void;

    /** Called once the modal's closing animation has finished */
    onModalHide?: () => void;
};

/**
 * Centered full-screen modal that re-renders the current chart scaled up to the viewport.
 * Must be rendered inside a VictoryChartProvider so VictoryChartContent can read the parsed chart context.
 *
 * The chart is rendered at its design size and uniformly transform-scaled to fit the modal —
 * the same technique the inline scaled container uses to shrink charts. This keeps the canvas
 * and the absolutely-positioned label/legend overlays (whose coordinates are design-based)
 * perfectly aligned, so the expanded chart looks identical to the inline one, only larger.
 * Rendering fluidly instead would resize only the canvas and leave labels at design coordinates,
 * misplacing them (and potentially overlaying the header, blocking the back button).
 */
function VictoryChartExpandModal({isVisible, onClose, onModalHide}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {chartContentStyles, chartContainerStyles, type} = useVictoryChartContext();
    const [availableSize, setAvailableSize] = useState({width: 0, height: 0});

    const onContainerLayout = (event: LayoutChangeEvent) => {
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
            onModalHide={onModalHide}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.details')}
                onBackButtonPress={onClose}
                shouldShowBackButton
            />
            <View
                style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5]}
                onLayout={onContainerLayout}
            >
                {isMeasured &&
                    (hasDesignDimensions && effectiveDesignHeight !== undefined ? (
                        // Clip the container (not the content) so polar dead space is hidden while the chart renders at full fidelity.
                        <View
                            style={[
                                StyleUtils.getWidthAndHeightStyle(designWidth * scale, effectiveDesignHeight * scale),
                                typeof borderRadius === 'number' && isPolar && StyleUtils.getBorderRadiusStyle(borderRadius),
                                styles.overflowHidden,
                            ]}
                        >
                            {/* Fixed design-size box so the fluid chart renders at design size, then scaled uniformly. */}
                            <View
                                style={[
                                    chartContentStyles,
                                    StyleUtils.getWidthAndHeightStyle(designWidth, designHeight),
                                    backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(backgroundColor),
                                    typeof borderRadius === 'number' && StyleUtils.getBorderRadiusStyle(borderRadius),
                                    styles.overflowHidden,
                                    styles.chartExpandedContent,
                                    StyleUtils.getTransformScaleStyle(scale),
                                ]}
                            >
                                <VictoryChartContent />
                            </View>
                        </View>
                    ) : (
                        // Charts without design dimensions have no design-based label coordinates, so fluid rendering is safe.
                        <View style={[styles.w100, styles.flex1]}>
                            <VictoryChartContent />
                        </View>
                    ))}
            </View>
        </Modal>
    );
}

VictoryChartExpandModal.displayName = 'VictoryChartExpandModal';

export default VictoryChartExpandModal;
