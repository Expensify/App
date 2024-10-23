import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

type WorkspaceExpensifyCardLoadingViewProps = {
    /** The policy ID */
    policyID: string;

    /** Whether the request is being processed */
    isLoading: boolean;

    /** Whether the bank account is on waitlist to be verified */
    cardOnWaitlist: boolean;
};

function WorkspaceExpensifyCardLoadingView({policyID, isLoading, cardOnWaitlist}: WorkspaceExpensifyCardLoadingViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const renderImage = () => {
        if (isLoading) {
            return (
                <Lottie
                    source={LottieAnimations.ReviewingBankInfo}
                    autoPlay
                    loop
                    style={styles.loadingVBAAnimation}
                    webStyle={styles.loadingVBAAnimationWeb}
                />
            );
        }
        if (cardOnWaitlist) {
            return (
                <Icon
                    width={variables.modalTopIconWidth}
                    height={variables.modalTopIconHeight}
                    src={Illustrations.Puzzle}
                />
            );
        }
        return (
            <Lottie
                source={LottieAnimations.Fireworks}
                autoPlay
                loop
                style={styles.loadingVBAAnimation}
                webStyle={styles.loadingVBAAnimationWeb}
            />
        );
    };

    const getTitleAndDescriptionText = () => {
        if (isLoading) {
            return {
                title: translate('workspace.expensifyCard.verifyingBankAccount'),
                description: translate('workspace.expensifyCard.verifyingBankAccountDescription'),
                buttonText: '',
                buttonAction: null,
            };
        }
        if (cardOnWaitlist) {
            return {
                title: translate('workspace.expensifyCard.oneMoreStep'),
                description: translate('workspace.expensifyCard.oneMoreStepDescription'),
                buttonText: translate('workspace.expensifyCard.goToConcierge'),
                buttonAction: () => Navigation.navigate(ROUTES.CONCIERGE),
            };
        }
        return {
            title: translate('workspace.expensifyCard.bankAccountVerified'),
            description: translate('workspace.expensifyCard.bankAccountVerifiedDescription'),
            buttonText: translate('workspace.expensifyCard.gotIt'),
            buttonAction: () => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID)),
        };
    };

    const {title, description, buttonText, buttonAction} = getTitleAndDescriptionText();

    const shouldShowButton = !!buttonText && !!buttonAction;

    return (
        <>
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('workspace.expensifyCard.verifyingHeader')}
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.pageWrapper, styles.flex1, styles.justifyContentCenter, styles.mb15]}>
                    {renderImage()}
                    <View style={[styles.ph5, styles.mt3]}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineLineHeightXXL, styles.mb3]}>{title}</Text>
                        <Text style={[styles.textAlignCenter, styles.textLabelSupporting]}>{description}</Text>
                    </View>
                </View>
                <FixedFooter>
                    {shouldShowButton && (
                        <Button
                            success
                            large
                            text={buttonText}
                            style={styles.mt6}
                            pressOnEnter
                            onPress={buttonAction}
                        />
                    )}
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </>
    );
}

export default WorkspaceExpensifyCardLoadingView;
