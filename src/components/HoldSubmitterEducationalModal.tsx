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

    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

function HoldSubmitterEducationalModal({onClose, onConfirm, isDM}: HoldSubmitterEducationalModalProps) {
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
            <FeatureTraining.Body>
                <FeatureTraining.BodyText style={styles.mb5}>
                    <FeatureTraining.Title>{translate('iou.holdEducationalTitle')}</FeatureTraining.Title>
                    <FeatureTraining.Description>{translate(isDM ? 'iou.whatIsHoldExplainDM' : 'iou.whatIsHoldExplain')}</FeatureTraining.Description>
                    <HoldMenuSectionList isDM={isDM} />
                </FeatureTraining.BodyText>
                <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
            </FeatureTraining.Body>
        </FeatureTrainingModal>
    );
}

export default HoldSubmitterEducationalModal;
