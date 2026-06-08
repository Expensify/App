import React, {useMemo} from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import type {FeatureTrainingModalPageProps} from '@components/FeatureTrainingModal';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function AIFeaturesPromoModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isBetaEnabled} = usePermissions();
    const canUseCustomAgent = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);

    const pages = useMemo<FeatureTrainingModalPageProps[]>(
        () => [
            {
                animation: LottieAnimations.SpendAnalysis,
                title: translate('aiFeaturesPromoModal.spendAnalysis.title'),
                subtitle: translate('aiFeaturesPromoModal.subtitle'),
                description: translate('aiFeaturesPromoModal.spendAnalysis.description'),
                confirmText: translate('common.next'),
            },
            {
                animation: LottieAnimations.ExpenseAssistant,
                title: translate('aiFeaturesPromoModal.expenseAssistant.title'),
                subtitle: translate('aiFeaturesPromoModal.subtitle'),
                description: translate('aiFeaturesPromoModal.expenseAssistant.description'),
                confirmText: canUseCustomAgent ? translate('common.next') : translate('aiFeaturesPromoModal.confirmText'),
            },
            ...(canUseCustomAgent
                ? [
                      {
                          animation: LottieAnimations.CustomAgents,
                          title: translate('aiFeaturesPromoModal.customAgents.title'),
                          subtitle: translate('aiFeaturesPromoModal.subtitle'),
                          description: translate('aiFeaturesPromoModal.customAgents.description'),
                          confirmText: translate('aiFeaturesPromoModal.confirmText'),
                      },
                  ]
                : []),
        ],
        [translate, canUseCustomAgent],
    );

    const onConfirm = () => {
        Log.hmmm('[AIFeaturesPromoModal] onConfirm called, dismissing product training');
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL);
    };

    const onClose = () => {
        Log.hmmm('[AIFeaturesPromoModal] onClose called, dismissing product training');
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL, true);
    };

    return (
        <FeatureTrainingModal
            pages={pages}
            onConfirm={onConfirm}
            onClose={onClose}
            width={variables.aiFeaturesPromoModalWidth}
            shouldRenderHTMLDescription
            illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.SpendAnalysis.backgroundColor), styles.cardSectionIllustration]}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={styles.mb4}
            titleStyles={styles.mb2}
        />
    );
}

export default AIFeaturesPromoModal;
