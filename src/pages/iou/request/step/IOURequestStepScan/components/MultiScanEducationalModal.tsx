import FeatureTraining from '@components/FeatureTraining';
import FeatureTrainingModal from '@components/FeatureTrainingModal';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import {useMultiScanActions, useMultiScanState} from './MultiScanContext';

/**
 * Self-contained educational modal for multi-scan. Reads visibility from state context, dismiss from actions context.
 * Renders nothing when context is absent or popup is hidden.
 */
function MultiScanEducationalModal() {
    const {showEducationalPopup} = useMultiScanState();
    const {dismissEducationalPopup} = useMultiScanActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan']);

    if (!showEducationalPopup || !dismissEducationalPopup) {
        return null;
    }

    return (
        <FeatureTrainingModal
            modalInnerContainerStyle={styles.pt0}
            onConfirm={dismissEducationalPopup}
        >
            <FeatureTraining.Illustration
                image={lazyIllustrations.MultiScan}
                imageHeight={220}
                outerContainerStyle={styles.multiScanEducationalPopupImage}
            />
            <FeatureTraining.Body>
                <FeatureTraining.BodyText style={styles.mb6}>
                    <FeatureTraining.Title style={styles.mb2}>{translate('iou.scanMultipleReceipts')}</FeatureTraining.Title>
                    <FeatureTraining.Description>{translate('iou.scanMultipleReceiptsDescription')}</FeatureTraining.Description>
                </FeatureTraining.BodyText>
                <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
            </FeatureTraining.Body>
        </FeatureTrainingModal>
    );
}

export default MultiScanEducationalModal;
