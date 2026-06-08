import React from 'react';
import {View} from 'react-native';
import Modal from '@components/Modal';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import computeFullscreenChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeFullscreenChartScale';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import VictoryChartContainerFixed from './VictoryChartContainer/VictoryChartContainerFixed';
import VictoryChartContent from './VictoryChartContent';

// Horizontal padding inside the full-screen chart modal.
const MODAL_HORIZONTAL_PADDING = 32;

type VictoryChartFullscreenModalProps = {
    isVisible: boolean;
    onClose: () => void;
};

function VictoryChartFullscreenModal({isVisible, onClose}: VictoryChartFullscreenModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const {left: safeAreaLeft, right: safeAreaRight} = useSafeAreaInsets();
    const {chartContentStyles} = useVictoryChartContext();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasDesignDimensions = designWidth !== undefined && designHeight !== undefined;

    const availableWidth = windowWidth - safeAreaLeft - safeAreaRight - MODAL_HORIZONTAL_PADDING;
    const scale = hasDesignDimensions ? computeFullscreenChartScale(designWidth, availableWidth) : 1;

    const themeStyles = {
        container: styles.chartContainer,
        content: styles.chartContent,
        mw100: styles.mw100,
    };

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED}
            onClose={onClose}
            shouldHandleNavigationBack
        >
            <View style={[styles.flex1, styles.appBG]}>
                <HeaderWithBackButton
                    title={translate('videoPlayer.fullscreen')}
                    shouldShowBorderBottom
                    shouldShowCloseButton={!shouldUseNarrowLayout}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={onClose}
                    onCloseButtonPress={onClose}
                    shouldSetModalVisibility={false}
                />
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph4]}>
                    {hasDesignDimensions && designHeight ? (
                        <VictoryChartContainerFixed
                            layout={{kind: 'scaled', designHeight, scale}}
                            themeStyles={themeStyles}
                        >
                            <VictoryChartContent />
                        </VictoryChartContainerFixed>
                    ) : (
                        <VictoryChartContainerFixed
                            layout={{kind: 'fluid'}}
                            themeStyles={themeStyles}
                        >
                            <VictoryChartContent />
                        </VictoryChartContainerFixed>
                    )}
                </View>
            </View>
        </Modal>
    );
}

VictoryChartFullscreenModal.displayName = 'VictoryChartFullscreenModal';

export default VictoryChartFullscreenModal;
