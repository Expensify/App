import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Badge from './Badge';
import CenteredModalLayout from './CenteredModalLayout';
import FeatureTraining from './FeatureTraining';
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

    const dismissNVP = (isDismissedUsingCloseButton: boolean) => {
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL, isDismissedUsingCloseButton);
    };

    const confirmAndCloseModal = () => {
        Navigation.goBack();
        dismissNVP(false);
    };

    const closeModal = () => {
        Navigation.goBack();
        dismissNVP(true);
    };

    const illustrationAspectRatio = LottieAnimations.SpendAnalysis.w / LottieAnimations.SpendAnalysis.h;
    const subtitle = translate('aiFeaturesPromoModal.subtitle');

    return (
        <CenteredModalLayout
            onBackdropPress={closeModal}
            width={variables.aiFeaturesPromoModalWidth}
            contentStyle={styles.pt0}
        >
            <FeatureTraining.Carousel
                onConfirm={confirmAndCloseModal}
                onClose={closeModal}
                width={variables.aiFeaturesPromoModalWidth}
                confirmSentryLabel={CONST.SENTRY_LABEL.AI_FEATURES_PROMO_MODAL.CONFIRM_BUTTON}
                shouldUseScrollView
            >
                <FeatureTraining.Page>
                    <FeatureTraining.Illustration
                        animation={LottieAnimations.SpendAnalysis}
                        outerContainerStyle={styles.p0}
                        aspectRatio={illustrationAspectRatio}
                    />
                    <FeatureTraining.Body>
                        <FeatureTraining.BodyText style={styles.mb4}>
                            <FeatureTraining.Subtitle>{subtitle}</FeatureTraining.Subtitle>
                            <FeatureTraining.Title style={styles.mb2}>{translate('aiFeaturesPromoModal.spendAnalysis.title')}</FeatureTraining.Title>
                            <FeatureTraining.Description shouldRenderHTML>{translate('aiFeaturesPromoModal.spendAnalysis.description')}</FeatureTraining.Description>
                        </FeatureTraining.BodyText>
                        <FeatureTraining.ButtonRow>
                            <FeatureTraining.BackButton style={styles.flex1} />
                            <FeatureTraining.ConfirmButton style={styles.flex1}>{translate('common.next')}</FeatureTraining.ConfirmButton>
                        </FeatureTraining.ButtonRow>
                    </FeatureTraining.Body>
                </FeatureTraining.Page>
                <FeatureTraining.Page>
                    <FeatureTraining.Illustration
                        animation={LottieAnimations.ExpenseAssistant}
                        outerContainerStyle={styles.p0}
                        aspectRatio={illustrationAspectRatio}
                    />
                    <FeatureTraining.Body>
                        <FeatureTraining.BodyText style={styles.mb4}>
                            <FeatureTraining.Subtitle>{subtitle}</FeatureTraining.Subtitle>
                            <FeatureTraining.Title style={styles.mb2}>{translate('aiFeaturesPromoModal.expenseAssistant.title')}</FeatureTraining.Title>
                            <FeatureTraining.Description shouldRenderHTML>{translate('aiFeaturesPromoModal.expenseAssistant.description')}</FeatureTraining.Description>
                        </FeatureTraining.BodyText>
                        <FeatureTraining.ButtonRow>
                            <FeatureTraining.BackButton style={styles.flex1} />
                            <FeatureTraining.ConfirmButton style={styles.flex1}>
                                {canUseCustomAgent ? translate('common.next') : translate('aiFeaturesPromoModal.confirmText')}
                            </FeatureTraining.ConfirmButton>
                        </FeatureTraining.ButtonRow>
                    </FeatureTraining.Body>
                </FeatureTraining.Page>
                {canUseCustomAgent && (
                    <FeatureTraining.Page>
                        <FeatureTraining.Illustration
                            animation={LottieAnimations.CustomAgents}
                            outerContainerStyle={styles.p0}
                            aspectRatio={illustrationAspectRatio}
                        />
                        <FeatureTraining.Body>
                            <FeatureTraining.BodyText style={styles.mb4}>
                                <FeatureTraining.Subtitle>{subtitle}</FeatureTraining.Subtitle>
                                <FeatureTraining.Title>{customAgentPromoTitle}</FeatureTraining.Title>
                                <FeatureTraining.Description shouldRenderHTML>{translate('aiFeaturesPromoModal.customAgents.description')}</FeatureTraining.Description>
                            </FeatureTraining.BodyText>
                            <FeatureTraining.ButtonRow>
                                <FeatureTraining.BackButton style={styles.flex1} />
                                <FeatureTraining.ConfirmButton style={styles.flex1}>{translate('aiFeaturesPromoModal.confirmText')}</FeatureTraining.ConfirmButton>
                            </FeatureTraining.ButtonRow>
                        </FeatureTraining.Body>
                    </FeatureTraining.Page>
                )}
            </FeatureTraining.Carousel>
        </CenteredModalLayout>
    );
}

export default AIFeaturesPromoModal;
