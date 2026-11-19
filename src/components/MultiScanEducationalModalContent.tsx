import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import FeatureTraining from './FeatureTraining';

/** Educational content shared by the native multi-scan modal's global stack entry. */
function MultiScanEducationalModalContent() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan']);

    return (
        <>
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
                <FeatureTraining.ConfirmButton sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.MULTI_SCAN_EDUCATIONAL_CONFIRM}>
                    {translate('common.buttonConfirm')}
                </FeatureTraining.ConfirmButton>
            </FeatureTraining.Body>
        </>
    );
}

export default MultiScanEducationalModalContent;
