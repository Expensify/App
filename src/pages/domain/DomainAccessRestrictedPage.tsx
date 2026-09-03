import ConfirmationPage from '@components/ConfirmationPage';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRequestAdminshipError, requestDomainAdminship} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
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

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [hasPendingRequest] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: hasPendingAdminshipRequestSelector(currentUserAccountID)});
    const [isRequestPending] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: (pendingActions) => !!pendingActions?.requestAdminship});
    const [requestError] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: (errors) => errors?.requestAdminshipError});

    useEffect(() => {
        return () => clearRequestAdminshipError(domainAccountID);
    }, [domainAccountID]);

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
                    <ConfirmationPage
                        illustration={icons.EmptyStateSpyPigeon}
                        heading={translate('domain.accessRestricted.title')}
                        innerContainerStyle={styles.p10}
                        descriptionComponent={
                            <View style={[styles.renderHTML, styles.flexRow]}>
                                <RenderHTML html={translate('domain.accessRestricted.description', domainName)} />
                            </View>
                        }
                        footerComponent={
                            !!requestError && (
                                <FormHelpMessage
                                    message={getLatestErrorMessage({errors: requestError})}
                                    style={styles.mb0}
                                />
                            )
                        }
                        shouldShowSecondaryButton
                        secondaryButtonText={translate(hasPendingRequest ? 'domain.requestSent' : 'domain.accessRestricted.requestAdminAccess')}
                        isSecondaryButtonLoading={isRequestPending}
                        isSecondaryButtonDisabled={!isRequestPending && (!!hasPendingRequest || isOffline)}
                        onSecondaryButtonPress={() => {
                            if (!currentUserAccountID) {
                                return;
                            }
                            requestDomainAdminship(domainAccountID, currentUserAccountID, false);
                        }}
                        shouldShowButton
                        buttonText={translate('domain.accessRestricted.verifyYourself')}
                        onButtonPress={() => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(domainAccountID))}
                    />
                </ScreenWrapper>
            )}
        </DomainNameOrNotFoundWrapper>
    );
}

export default DomainAccessRestrictedPage;
