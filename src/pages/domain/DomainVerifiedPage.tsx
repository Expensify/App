import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function DomainVerifiedPage({accountID, redirectTo}: {accountID: number; redirectTo: 'WORKSPACES_VERIFY_DOMAIN' | 'DOMAIN_VERIFY'}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: false});

    useEffect(() => {
        if (domain?.validated) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES[redirectTo].getRoute(accountID), {forceReplace: true}));
    }, [accountID, domain?.validated, redirectTo]);

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={DomainVerifiedPage.displayName}
        >
            <HeaderWithBackButton title={translate('domain.domainVerified.title')} />
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('domain.domainVerified.header')}
                descriptionComponent={
                    <View style={styles.w100}>
                        <RenderHTML html={translate('domain.domainVerified.description', {domainName: Str.extractEmailDomain(domain?.email ?? '')})} />
                    </View>
                }
                innerContainerStyle={styles.p10}
                buttonText={translate('common.buttonConfirm')}
                shouldShowButton
                onButtonPress={() => Navigation.dismissModal()}
                footerStyle={styles.mb5}
            />
        </ScreenWrapper>
    );
}

DomainVerifiedPage.displayName = 'DomainVerifiedPage';
export default DomainVerifiedPage;
