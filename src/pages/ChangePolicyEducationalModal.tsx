import CenteredModalLayout from '@components/CenteredModalLayout';
import ChangeWorkspaceMenuSectionList from '@components/ChangeWorkspaceMenuSectionList';
import FeatureTraining from '@components/FeatureTraining';

import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissChangePolicyModal} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

function ChangePolicyEducationalModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['ReceiptFairy']);

    const handleConfirm = () => {
        dismissChangePolicyModal();
    };

    useBeforeRemove(handleConfirm);

    const handleClose = () => {
        Navigation.goBack();
    };

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            width={variables.changePolicyEducationModalWidth}
            contentStyle={[styles.pt0, styles.pb0]}
        >
            <FeatureTraining
                onConfirm={handleClose}
                onClose={handleClose}
                width={variables.changePolicyEducationModalWidth}
                shouldUseScrollView
            >
                <FeatureTraining.Illustration
                    image={illustrations.ReceiptFairy}
                    imageWidth={variables.changePolicyEducationModalIconWidth}
                    imageHeight={variables.changePolicyEducationModalIconHeight}
                    contentFitImage="cover"
                    aspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                    innerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.blue700)]}
                    outerContainerStyle={styles.p0}
                />
                <FeatureTraining.Body>
                    <FeatureTraining.BodyText style={[styles.mb5, styles.gap2]}>
                        <FeatureTraining.Title>{translate('iou.changePolicyEducational.title')}</FeatureTraining.Title>
                        <FeatureTraining.Description>{translate('iou.changePolicyEducational.description')}</FeatureTraining.Description>
                        <ChangeWorkspaceMenuSectionList />
                    </FeatureTraining.BodyText>
                    <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
                </FeatureTraining.Body>
            </FeatureTraining>
        </CenteredModalLayout>
    );
}

export default ChangePolicyEducationalModal;
