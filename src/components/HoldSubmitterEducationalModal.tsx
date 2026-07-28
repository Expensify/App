import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import FeatureTraining from './FeatureTraining';
import FeatureTrainingModal from './FeatureTrainingModal';
import HoldMenuSectionList from './HoldMenuSectionList';

type HoldSubmitterEducationalModalProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

function HoldSubmitterEducationalModal({onClose, onConfirm}: HoldSubmitterEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HoldExpense']);

    useBeforeRemove(onClose);

    return (
        <FeatureTrainingModal
            width={variables.holdEducationModalWidth}
            modalInnerContainerStyle={styles.pt0}
            onClose={onClose}
            onConfirm={onConfirm}
            shouldCloseOnConfirm={false}
            shouldUseScrollView
        >
            <FeatureTraining.Illustration
                image={illustrations.HoldExpense}
                contentFitImage="cover"
                aspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                outerContainerStyle={styles.p0}
            />
            <FeatureTraining.Body innerStyle={styles.mb5}>
                <FeatureTraining.Title>{translate('iou.holdEducationalTitle')}</FeatureTraining.Title>
                <FeatureTraining.Description>{translate('iou.whatIsHoldExplain')}</FeatureTraining.Description>
                <HoldMenuSectionList />
                <FeatureTraining.ButtonRow>
                    <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
                </FeatureTraining.ButtonRow>
            </FeatureTraining.Body>
        </FeatureTrainingModal>
    );
}

export default HoldSubmitterEducationalModal;
