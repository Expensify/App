import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import {isAdminSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type BaseDomainVerifiedPageProps = {
    domainAccountID: number;

    /** Route to redirect to when trying to access the page for an unverified domain */
    redirectTo: Route;

    /** Route to navigate to when the user confirms verification success */
    confirmDestination?: Route;
};

function BaseDomainVerifiedPage({domainAccountID, redirectTo, confirmDestination = ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID)}: BaseDomainVerifiedPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`);
    const isAdmin = isAdminSelector(currentUserAccountID)(domain);
    const doesDomainExist = !!domain;

    useEffect(() => {
        if (!doesDomainExist || domain?.validated) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(redirectTo, {forceReplace: true}));
    }, [domainAccountID, domain?.validated, doesDomainExist, redirectTo]);

    if (isLoadingOnyxValue(domainMetadata)) {
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
            <ConfirmationPage>
                <ConfirmationPage.Content style={styles.p10}>
                    <ConfirmationPage.Illustration />
                    <ConfirmationPage.Heading>{translate('domain.domainVerified.header')}</ConfirmationPage.Heading>
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('domain.domainVerified.description', {domainName: Str.extractEmailDomain(domain.email)})} />
                    </View>
                </ConfirmationPage.Content>
                <FixedFooter>
                    <ConfirmationPage.PrimaryButton
                        text={translate('common.buttonConfirm')}
                        onPress={() => Navigation.navigate(confirmDestination)}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default BaseDomainVerifiedPage;
