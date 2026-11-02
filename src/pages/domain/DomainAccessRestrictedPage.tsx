import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useRedirectOnDomainAccessChange from '@hooks/useRedirectOnDomainAccessChange';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRequestAdminshipError, requestDomainAdminship} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {hasPendingAdminshipRequestSelector} from '@src/selectors/Domain';
import {accountIDSelector} from '@src/selectors/Session';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import DomainNameOrNotFoundWrapper from './DomainNameOrNotFoundWrapper';

type DomainAccessRestrictedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED>;

function DomainAccessRestrictedPage({route}: DomainAccessRestrictedPageProps) {
    const {domainAccountID} = route.params;
    const icons = useMemoizedLazyExpensifyIcons(['EmptyStateSpyPigeon']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {
        selector: accountIDSelector,
    });
    const [hasPendingRequest] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: hasPendingAdminshipRequestSelector(currentUserAccountID)});
    const [isRequestPending] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: (pendingActions) => !!pendingActions?.requestAdminship});
    const [requestError] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: (errors) => errors?.requestAdminshipError});

    const isRedirecting = useRedirectOnDomainAccessChange(domainAccountID, {
        whenAccessLost: ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(domainAccountID),
        shouldDismissWhenAdmin: true,
    });

    useEffect(() => {
        return () => clearRequestAdminshipError(domainAccountID);
    }, [domainAccountID]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <DomainNameOrNotFoundWrapper
            domainAccountID={domainAccountID}
            onLinkPress={() => Navigation.dismissModal()}
        >
            {(domainName) => (
                <ScreenWrapper testID="DomainAccessRestrictedPage">
                    <HeaderWithBackButton
                        title={translate('domain.accessRestricted.headerTitle')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ConfirmationPage>
                        <ConfirmationPage.Content
                            style={styles.p10}
                            requestErrors={requestError}
                        >
                            <ConfirmationPage.Illustration illustration={icons.EmptyStateSpyPigeon} />
                            <ConfirmationPage.Heading>{translate('domain.accessRestricted.title')}</ConfirmationPage.Heading>
                            <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                                <RenderHTML html={translate('domain.accessRestricted.description', domainName)} />
                            </View>
                        </ConfirmationPage.Content>
                        <FixedFooter>
                            <ConfirmationPage.SecondaryButton
                                text={translate(hasPendingRequest ? 'domain.requestSent' : 'domain.accessRestricted.requestAdminAccess')}
                                isLoading={isRequestPending}
                                isDisabled={!isRequestPending && (!!hasPendingRequest || isOffline)}
                                onPress={() => {
                                    if (!currentUserAccountID) {
                                        return;
                                    }
                                    requestDomainAdminship(domainAccountID, currentUserAccountID, false);
                                }}
                            />
                            <ConfirmationPage.PrimaryButton
                                text={translate('domain.accessRestricted.verifyYourself')}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(domainAccountID))}
                            />
                        </FixedFooter>
                    </ConfirmationPage>
                </ScreenWrapper>
            )}
        </DomainNameOrNotFoundWrapper>
    );
}

export default DomainAccessRestrictedPage;
