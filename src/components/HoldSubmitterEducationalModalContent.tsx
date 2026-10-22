import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import FeatureTraining from './FeatureTraining';
import HoldMenuSectionList from './HoldMenuSectionList';

type HoldSubmitterEducationalModalContentProps = {
    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

/** The content of the "Should you hold this expense?" educational modal, rendered inside a FeatureTrainingModal */
function HoldSubmitterEducationalModalContent({isDM}: HoldSubmitterEducationalModalContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HoldExpense']);

    return (
        <>
            <FeatureTraining.Illustration
                image={illustrations.HoldExpense}
                contentFitImage="cover"
                aspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                outerContainerStyle={styles.p0}
            />
            <FeatureTraining.Body>
                <FeatureTraining.BodyText style={styles.mb5}>
                    <FeatureTraining.Title>{translate('iou.holdEducationalTitle')}</FeatureTraining.Title>
                    <FeatureTraining.Description>{translate(isDM ? 'iou.whatIsHoldExplainDM' : 'iou.whatIsHoldExplain')}</FeatureTraining.Description>
                    <HoldMenuSectionList isDM={isDM} />
                </FeatureTraining.BodyText>
                <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
            </FeatureTraining.Body>
        </>
    );
}

export default HoldSubmitterEducationalModalContent;
