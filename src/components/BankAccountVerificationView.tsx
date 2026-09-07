import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import Navigation from '@navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import BlockingView from './BlockingViews/BlockingView';
import Button from './ButtonComposed';
import LottieAnimations from './LottieAnimations';

type BankAccountVerificationViewProps = {
    verificationState: ValueOf<typeof CONST.EXPENSIFY_CARD.VERIFICATION_STATE> | '';
    children: React.ReactNode;
    onVerifiedButtonPress?: () => void;
    verifiedButtonText?: string;
    verifiedTitle?: string;
    verifiedSubtitle?: string;
};

function BankAccountVerificationView({verificationState, children, onVerifiedButtonPress, verifiedButtonText, verifiedTitle, verifiedSubtitle}: BankAccountVerificationViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Puzzle', 'Fireworks']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true});

    if (!verificationState) {
        return children;
    }

    switch (verificationState) {
        case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
            return (
                <BlockingView
                    title={translate('workspace.expensifyCard.verifyingBankAccount')}
                    subtitle={translate('workspace.expensifyCard.verifyingBankAccountDescription')}
                    animation={LottieAnimations.ReviewingBankInfo}
                    animationStyles={styles.loadingVBAAnimation}
                    animationWebStyle={styles.loadingVBAAnimationWeb}
                    subtitleStyle={styles.textLabelSupporting}
                    containerStyle={styles.pb20}
                    addBottomSafeAreaPadding
                />
            );
        case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
            return (
                <>
                    <BlockingView
                        title={translate('workspace.expensifyCard.oneMoreStep')}
                        subtitle={translate('workspace.expensifyCard.oneMoreStepDescription')}
                        icon={illustrations.Puzzle}
                        subtitleStyle={styles.textLabelSupporting}
                        iconHeight={variables.cardPreviewHeight}
                        iconWidth={variables.cardPreviewHeight}
                    />
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.m5, bottomSafeAreaPaddingStyle]}
                        onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('workspace.expensifyCard.goToConcierge')}</Button.Text>
                    </Button>
                </>
            );
        case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
            return (
                <>
                    {isReduceMotionEnabled ? (
                        <BlockingView
                            title={verifiedTitle ?? translate('workspace.expensifyCard.bankAccountVerified')}
                            subtitle={verifiedSubtitle ?? translate('workspace.expensifyCard.bankAccountVerifiedDescription')}
                            icon={illustrations.Fireworks}
                            iconWidth={Number(styles.loadingVBAAnimation.width)}
                            iconHeight={Number(styles.loadingVBAAnimation.height)}
                            subtitleStyle={styles.textLabelSupporting}
                        />
                    ) : (
                        <BlockingView
                            title={verifiedTitle ?? translate('workspace.expensifyCard.bankAccountVerified')}
                            subtitle={verifiedSubtitle ?? translate('workspace.expensifyCard.bankAccountVerifiedDescription')}
                            animation={LottieAnimations.Fireworks}
                            animationStyles={styles.loadingVBAAnimation}
                            animationWebStyle={styles.loadingVBAAnimationWeb}
                            subtitleStyle={styles.textLabelSupporting}
                        />
                    )}
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.m5, bottomSafeAreaPaddingStyle]}
                        onPress={onVerifiedButtonPress}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{verifiedButtonText ?? translate('workspace.expensifyCard.gotIt')}</Button.Text>
                    </Button>
                </>
            );
        default:
            return children;
    }
}

BankAccountVerificationView.displayName = 'BankAccountVerificationView';

export default BankAccountVerificationView;
