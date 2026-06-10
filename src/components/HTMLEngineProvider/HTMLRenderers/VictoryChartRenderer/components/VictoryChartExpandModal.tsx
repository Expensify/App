import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import VictoryChartContent from './VictoryChartContent';

type VictoryChartExpandModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Called when the modal should close */
    onClose: () => void;
};

/**
 * Centered full-screen modal that re-renders the current chart at full viewport width.
 * Must be rendered inside a VictoryChartProvider so VictoryChartContent can read the parsed chart context.
 */
function VictoryChartExpandModal({isVisible, onClose}: VictoryChartExpandModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={onClose}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('common.details')}
                onBackButtonPress={onClose}
                shouldShowBackButton
            />
            {/* No explicitSize, so the chart renders fluidly and fills the modal viewport width. */}
            <View style={[styles.flex1, styles.justifyContentCenter, styles.ph5]}>
                <VictoryChartContent />
            </View>
        </Modal>
    );
}

VictoryChartExpandModal.displayName = 'VictoryChartExpandModal';

export default VictoryChartExpandModal;
