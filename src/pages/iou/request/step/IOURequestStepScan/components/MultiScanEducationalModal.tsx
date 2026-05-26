import React from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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
            title={translate('iou.scanMultipleReceipts')}
            image={lazyIllustrations.MultiScan}
            shouldRenderSVG
            imageHeight="auto"
            imageWidth="auto"
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.multiScanEducationalPopupImage}
            onConfirm={dismissEducationalPopup}
            titleStyles={styles.mb2}
            confirmText={translate('common.buttonConfirm')}
            description={translate('iou.scanMultipleReceiptsDescription')}
            contentInnerContainerStyles={styles.mb6}
            shouldGoBack={false}
        />
    );
}

export default MultiScanEducationalModal;
