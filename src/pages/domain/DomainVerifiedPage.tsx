import {Str} from 'expensify-common';
import React from 'react';
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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainModalNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type DomainVerifiedPageProps = PlatformStackScreenProps<DomainModalNavigatorParamList, typeof SCREENS.DOMAIN.DOMAIN_VERIFIED>;

function DomainVerifiedPage({route}: DomainVerifiedPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = route.params?.accountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: false});

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
            />
        </ScreenWrapper>
    );
}

DomainVerifiedPage.displayName = 'DomainVerifiedPage';
export default DomainVerifiedPage;
