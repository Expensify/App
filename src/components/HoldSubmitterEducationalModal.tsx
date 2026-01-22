import React from 'react';
import type {ValueOf} from 'type-fest';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';
import HoldMenuSectionList from './HoldMenuSectionList';
import type {ModalProps} from './Modal/Global/ModalContext';

const HoldSubmitterEducationalModalActions = {
    CONFIRMED: 'CONFIRMED',
} as const;

type HoldSubmitterEducationalModalAction = ValueOf<typeof HoldSubmitterEducationalModalActions>;

type HoldSubmitterEducationalModalProps = ModalProps<HoldSubmitterEducationalModalAction>;

function HoldSubmitterEducationalModal({closeModal}: HoldSubmitterEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HoldExpense']);

    const handleClose = () => {
        closeModal({action: HoldSubmitterEducationalModalActions.CONFIRMED});
    };

    useBeforeRemove(handleClose);

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
            onClose={handleClose}
            onConfirm={handleClose}
            shouldCloseOnConfirm={false}
            shouldGoBack={false}
            shouldUseScrollView
        >
            <HoldMenuSectionList />
        </FeatureTrainingModal>
    );
}

export default HoldSubmitterEducationalModal;
export {HoldSubmitterEducationalModalActions};
export type {HoldSubmitterEducationalModalAction};
