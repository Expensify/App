import React from 'react';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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
            title={translate('iou.holdEducationalTitle')}
            description={translate('iou.whatIsHoldExplain')}
            confirmText={translate('common.buttonConfirm')}
            image={illustrations.HoldExpense}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            contentInnerContainerStyles={styles.mb5}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            onClose={onClose}
            onConfirm={onConfirm}
            shouldCloseOnConfirm={false}
            shouldGoBack={false}
            shouldUseScrollView
        >
            <HoldMenuSectionList />
        </FeatureTrainingModal>
    );
}

export default HoldSubmitterEducationalModal;
