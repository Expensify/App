import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainVerifiedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_VERIFIED>;

function DomainVerifiedPage({route}: DomainVerifiedPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = route.params.accountID;
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: false});

    const doesDomainExist = !!domain;

    useEffect(() => {
        if (!doesDomainExist || domain?.validated) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(accountID), {forceReplace: true}));
    }, [accountID, domain?.validated, doesDomainExist]);

    if (domainMetadata.status === 'loading') {
        return <FullScreenLoadingIndicator />;
    }

    if (!domain) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={DomainVerifiedPage.displayName}
            shouldShowOfflineIndicator={false}
        >
            <HeaderWithBackButton title={translate('domain.domainVerified.title')} />
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('domain.domainVerified.header')}
                descriptionComponent={
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('domain.domainVerified.description', {domainName: Str.extractEmailDomain(domain.email)})} />
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
