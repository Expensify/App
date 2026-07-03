import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import Modal from '@components/Modal';

import useLocalize from '@hooks/useLocalize';
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
function VictoryChartExpandModal({isVisible, onClose}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {chartContentStyles} = useVictoryChartContext();
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

    // Uniform scale that fits the chart's design box inside the available modal area (may be > 1).
    const scale = hasDesignDimensions && isMeasured ? Math.min(availableSize.width / designWidth, availableSize.height / designHeight) : 1;

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={onClose}
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
                    (hasDesignDimensions ? (
                        <View style={{width: designWidth * scale, height: designHeight * scale, overflow: 'hidden'}}>
                            {/* Fixed design-size box so the fluid chart renders at design size, then scaled uniformly. */}
                            <View style={{width: designWidth, height: designHeight, transform: [{scale}], transformOrigin: 'top left'}}>
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
