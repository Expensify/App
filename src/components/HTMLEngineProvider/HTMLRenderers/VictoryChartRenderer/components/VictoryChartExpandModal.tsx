import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import Modal from '@components/Modal';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import VictoryChartContent from './VictoryChartContent';
import VictoryChartExpandedContent from './VictoryChartExpandedContent';

type VictoryChartExpandModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Called when the modal should close */
    onClose: () => void;
};

/**
 * Centered full-screen modal that presents the current chart scaled up to the viewport, with
 * platform-appropriate zoom mirroring the image attachment viewer: pinch/double-tap on touch
 * devices, click + scroll on desktop web.
 * Must be rendered inside a VictoryChartProvider so the chart can read the parsed chart context.
 */
function VictoryChartExpandModal({isVisible, onClose}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {chartContentStyles, chartContainerStyles} = useVictoryChartContext();
    const [availableSize, setAvailableSize] = useState({width: 0, height: 0});

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

    const hasDesignDimensions = typeof chartContentStyles.width === 'number' && typeof chartContentStyles.height === 'number';
    const isMeasured = availableSize.width > 0 && availableSize.height > 0;

    // Visual styles for the fluid fallback, resolved the same way the inline container resolves them.
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
                            (hasDesignDimensions ? (
                                <VictoryChartExpandedContent
                                    availableSize={availableSize}
                                    isVisible={isVisible}
                                />
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
