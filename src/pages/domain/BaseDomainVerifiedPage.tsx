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
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type BaseDomainVerifiedPageProps = {
    /** The accountID of the domain */
    domainAccountID: number;

    /** Route to redirect to when trying to access the page for an unverified domain */
    redirectTo: Route;
};

function BaseDomainVerifiedPage({domainAccountID, redirectTo}: BaseDomainVerifiedPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false});
    const [isAdmin, isAdminMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainAccountID}`, {canBeMissing: false});
    const doesDomainExist = !!domain;

    useEffect(() => {
        if (!doesDomainExist || domain?.validated) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(redirectTo, {forceReplace: true}));
    }, [domainAccountID, domain?.validated, doesDomainExist, redirectTo]);

    if (isLoadingOnyxValue(domainMetadata, isAdminMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!domain || !isAdmin) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <ScreenWrapper
            testID="BaseDomainVerifiedPage"
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
                onButtonPress={() => Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID))}
            />
        </ScreenWrapper>
    );
}

export default BaseDomainVerifiedPage;
