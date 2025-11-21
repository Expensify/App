import React, {useCallback} from 'react';
import ChangeWorkspaceMenuSectionList from '@components/ChangeWorkspaceMenuSectionList';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissChangePolicyModal} from '@libs/actions/Report';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function ChangePolicyEducationalModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['ReceiptFairy'] as const);

    const onConfirm = useCallback(() => {
        dismissChangePolicyModal();
    }, []);

    useBeforeRemove(onConfirm);

    return (
        <FeatureTrainingModal
            title={translate('iou.changePolicyEducational.title')}
            description={translate('iou.changePolicyEducational.description')}
            confirmText={translate('common.buttonConfirm')}
            image={illustrations.ReceiptFairy}
            imageWidth={variables.changePolicyEducationModalIconWidth}
            imageHeight={variables.changePolicyEducationModalIconHeight}
            contentFitImage="cover"
            width={variables.changePolicyEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.blue700)]}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={[styles.mb5, styles.gap2]}
            onClose={onConfirm}
            onConfirm={onConfirm}
        >
            <ChangeWorkspaceMenuSectionList />
        </FeatureTrainingModal>
    );
}

ChangePolicyEducationalModal.displayName = 'ChangePolicyEducationalModal';

export default ChangePolicyEducationalModal;
