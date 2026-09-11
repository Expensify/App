import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import VictoryChartContent from './VictoryChartContent';
import VictoryChartExpandedContent from './VictoryChartExpandedContent';
import useExpandedChartLayout from './VictoryChartExpandedContent/useExpandedChartLayout';

type VictoryChartExpandModalProps = {
    isVisible: boolean;

    /** Called when the modal should close */
    onClose: () => void;
};

/**
 * Full-screen modal presenting the current chart scaled up to the viewport, with attachment-style
 * zoom (pinch/double-tap on touch, click + scroll on desktop web). Must be rendered inside a
 * VictoryChartProvider.
 */
function VictoryChartExpandModal({isVisible, onClose}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [availableSize, setAvailableSize] = useState({width: 0, height: 0});
    // The chart stays mounted through the close animation and is released once the modal has hidden
    const [isHidden, setIsHidden] = useState(!isVisible);
    const layout = useExpandedChartLayout(availableSize);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        setIsHidden(false);
    }, [isVisible]);

    const onContainerLayout = (event: LayoutChangeEvent) => {
        // Re-measuring mid close animation would rescale the chart
        if (!isVisible) {
            return;
        }
        const {width, height} = event.nativeEvent.layout;
        setAvailableSize((prev) => (prev.width === width && prev.height === height ? prev : {width, height}));
    };

    const isMeasured = availableSize.width > 0 && availableSize.height > 0;
    const shouldRenderChart = isMeasured && (isVisible || !isHidden);

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={onClose}
            onModalHide={() => setIsHidden(true)}
            // Browser back should close only the modal, not the report behind it
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            {/* GestureHandlerRootView is required for gestures inside an Android modal (separate native window),
                and painting appBG here avoids the unpainted modal base flashing through on dark themes */}
            <GestureHandlerRootView style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.appBG)]}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    shouldShowBorderBottom
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldShowCloseButton={!shouldUseNarrowLayout}
                    onBackButtonPress={onClose}
                    onCloseButtonPress={onClose}
                />
                <View style={[styles.flex1, styles.ph5]}>
                    <View
                        style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}
                        onLayout={onContainerLayout}
                    >
                        {shouldRenderChart &&
                            (layout.hasLayout ? (
                                <VictoryChartExpandedContent
                                    availableSize={availableSize}
                                    layout={layout}
                                    isVisible={isVisible}
                                    onSwipeDown={onClose}
                                />
                            ) : (
                                // Charts without design dimensions render fluid, like inline
                                <View
                                    style={[
                                        styles.w100,
                                        styles.flex1,
                                        layout.backgroundColor !== undefined && StyleUtils.getBackgroundColorStyle(layout.backgroundColor),
                                        layout.designBorderRadius !== undefined && StyleUtils.getBorderRadiusStyle(layout.designBorderRadius),
                                        styles.overflowHidden,
                                    ]}
                                >
                                    <VictoryChartContent shouldUseStaticCanvas />
                                </View>
                            ))}
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

VictoryChartExpandModal.displayName = 'VictoryChartExpandModal';

export default VictoryChartExpandModal;
