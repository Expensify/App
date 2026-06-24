import React from 'react';
import type {ReactNode} from 'react';
import CenteredModalLayout from '@components/CenteredModalLayout';
import FeatureTrainingContent from '@components/FeatureTrainingContent';
import HoldMenuSectionList from '@components/HoldMenuSectionList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type BaseHoldSubmitterEducationalModalProps = {
    onDismiss: () => void;
    children?: ReactNode;
};

function BaseHoldSubmitterEducationalModal({onDismiss, children}: BaseHoldSubmitterEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HoldExpense']);

    return (
        <CenteredModalLayout
            onBackdropPress={onDismiss}
            width={variables.holdEducationModalWidth}
            contentStyle={[styles.pt0]}
        >
            <FeatureTrainingContent
                title={translate('iou.holdEducationalTitle')}
                description={translate('iou.whatIsHoldExplain')}
                confirmText={translate('common.buttonConfirm')}
                image={illustrations.HoldExpense}
                contentFitImage="cover"
                width={variables.holdEducationModalWidth}
                illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                contentInnerContainerStyles={styles.mb5}
                illustrationOuterContainerStyle={styles.p0}
                onClose={onDismiss}
                shouldUseScrollView
            >
                {children ?? <HoldMenuSectionList />}
            </FeatureTrainingContent>
        </CenteredModalLayout>
    );
}

export default BaseHoldSubmitterEducationalModal;
