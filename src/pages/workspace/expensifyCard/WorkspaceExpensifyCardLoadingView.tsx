import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WorkspaceExpensifyCardLoadingViewProps = {
    policyID: string;
};

function WorkspaceExpensifyCardLoadingView({policyID}: WorkspaceExpensifyCardLoadingViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    return (
        <>
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('workspace.expensifyCard.verifyingHeader')}
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.pageWrapper, styles.flex1, styles.justifyContentCenter, styles.mb15]}>
                    <Lottie
                        source={LottieAnimations.Fireworks}
                        autoPlay
                        loop
                        style={styles.loadingVBAAnimation}
                        webStyle={styles.loadingVBAAnimationWeb}
                    />
                    <View style={styles.ph5}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('workspace.expensifyCard.bankAccountVerified')}</Text>
                        <Text style={[styles.textAlignCenter, styles.textLabelSupporting]}>{translate('workspace.expensifyCard.bankAccountVerifiedDescription')}</Text>
                    </View>
                </View>
                <FixedFooter>
                    <Button
                        success
                        large
                        text={'Got it'}
                        style={styles.mt6}
                        pressOnEnter
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID))}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </>
    );
}

export default WorkspaceExpensifyCardLoadingView;
