import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import LottieAnimations from '@components/LottieAnimations';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type BankAccountVerificationViewProps = {
    /** Current verification state from CONST.EXPENSIFY_CARD.VERIFICATION_STATE */
    verificationState: string;

    /** Content to render when not in a verification state */
    children: React.ReactNode;

    /** Callback for the VERIFIED state CTA button */
    onVerifiedButtonPress?: () => void;

    /** Custom text for the VERIFIED state CTA button */
    verifiedButtonText?: string;
};

function BankAccountVerificationView({verificationState, children, onVerifiedButtonPress, verifiedButtonText}: BankAccountVerificationViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Puzzle']);
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
                        success
                        large
                        text={translate('workspace.expensifyCard.goToConcierge')}
                        style={[styles.m5, bottomSafeAreaPaddingStyle]}
                        pressOnEnter
                        onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                    />
                </>
            );
        case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
            return (
                <>
                    <BlockingView
                        title={translate('workspace.expensifyCard.bankAccountVerified')}
                        subtitle={translate('workspace.expensifyCard.bankAccountVerifiedDescription')}
                        animation={LottieAnimations.Fireworks}
                        animationStyles={styles.loadingVBAAnimation}
                        animationWebStyle={styles.loadingVBAAnimationWeb}
                        subtitleStyle={styles.textLabelSupporting}
                    />
                    <Button
                        success
                        large
                        text={verifiedButtonText ?? translate('workspace.expensifyCard.gotIt')}
                        style={[styles.m5, bottomSafeAreaPaddingStyle]}
                        pressOnEnter
                        onPress={onVerifiedButtonPress}
                    />
                </>
            );
        default:
            return children;
    }
}

BankAccountVerificationView.displayName = 'BankAccountVerificationView';

export default BankAccountVerificationView;
