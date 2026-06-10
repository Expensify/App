import React, {useRef} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import type {FeatureTrainingModalPageProps} from '@components/FeatureTrainingModal';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function AIFeaturesPromoModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const canUseCustomAgent = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);

    const customAgentPromoTitle = (
        <View style={[styles.dFlex, styles.flexRow]}>
            <Text style={[styles.textHeadlineH1, styles.mb2]}>{translate('aiFeaturesPromoModal.customAgents.title')}</Text>
            <Badge
                isStrong
                isCondensed
                text={translate('common.beta')}
            />
        </View>
    );

    const pages: FeatureTrainingModalPageProps[] = [
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
                      title: customAgentPromoTitle,
                      subtitle: translate('aiFeaturesPromoModal.subtitle'),
                      description: translate('aiFeaturesPromoModal.customAgents.description'),
                      confirmText: translate('aiFeaturesPromoModal.confirmText'),
                  },
              ]
            : []),
    ];

    const wasDismissedViaConfirmRef = useRef(false);

    const onConfirm = () => {
        Log.hmmm('[AIFeaturesPromoModal] onConfirm called, recording click dismissal');
        wasDismissedViaConfirmRef.current = true;
    };

    const onClose = () => {
        const isCloseButtonDismissal = !wasDismissedViaConfirmRef.current;
        Log.hmmm(`[AIFeaturesPromoModal] onClose called, dismissing product training via ${isCloseButtonDismissal ? 'x' : 'click'}`);
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL, isCloseButtonDismissal);
    };

    return (
        <FeatureTrainingModal
            pages={pages}
            onConfirm={onConfirm}
            onClose={onClose}
            width={variables.aiFeaturesPromoModalWidth}
            shouldRenderHTMLDescription
            shouldUseScrollView
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={styles.mb4}
            modalInnerContainerStyle={styles.pt0}
            titleStyles={styles.mb2}
        />
    );
}

export default AIFeaturesPromoModal;
