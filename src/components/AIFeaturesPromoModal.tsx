import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useRef} from 'react';
import {View} from 'react-native';

import type {FeatureTrainingContentDataProps} from './FeatureTrainingContent';

import Badge from './Badge';
import CenteredModalLayout from './CenteredModalLayout';
import {FeatureTrainingCarousel} from './FeatureTrainingContent';
import LottieAnimations from './LottieAnimations';
import Text from './Text';

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
                badgeStyles={styles.mb2}
            />
        </View>
    );

    const pages: FeatureTrainingContentDataProps[] = [
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

    const isCloseButtonDismissalRef = useRef(false);

    const dismissModal = () => {
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL, isCloseButtonDismissalRef.current);
    };

    useBeforeRemove(dismissModal);

    const goBack = () => {
        Navigation.goBack();
    };

    const onClose = () => {
        isCloseButtonDismissalRef.current = true;
        Navigation.goBack();
    };

    return (
        <CenteredModalLayout
            onBackdropPress={onClose}
            width={variables.aiFeaturesPromoModalWidth}
            contentStyle={styles.pt0}
        >
            <FeatureTrainingCarousel
                pages={pages}
                onConfirm={goBack}
                onClose={onClose}
                width={variables.aiFeaturesPromoModalWidth}
                shouldRenderHTMLDescription
                shouldUseScrollView
                illustrationOuterContainerStyle={styles.p0}
                illustrationAspectRatio={LottieAnimations.SpendAnalysis.w / LottieAnimations.SpendAnalysis.h}
                contentInnerContainerStyles={styles.mb4}
                titleStyles={styles.mb2}
                confirmSentryLabel={CONST.SENTRY_LABEL.AI_FEATURES_PROMO_MODAL.CONFIRM_BUTTON}
                helpSentryLabel={CONST.SENTRY_LABEL.AI_FEATURES_PROMO_MODAL.HELP_BUTTON}
            />
        </CenteredModalLayout>
    );
}

export default AIFeaturesPromoModal;
