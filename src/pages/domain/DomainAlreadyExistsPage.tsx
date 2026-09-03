import ConfirmationPage from '@components/ConfirmationPage';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
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

import React, {useEffect, useState} from 'react';

type DomainAlreadyExistsPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ALREADY_EXISTS>;

function DomainAlreadyExistsPage({route}: DomainAlreadyExistsPageProps) {
    const {domainAccountID} = route.params;
    const {asset: EmptyStateDomainExists} = useMemoizedLazyAsset(() => loadIllustration('EmptyStateDomainExists'));
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [hasPendingRequest] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: hasPendingAdminshipRequestSelector(currentUserAccountID)});
    // The add domain page drops the entry that came with the failure, so anything left here without an accountID only carries this flow.
    const [isTransientDomainEntry] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: (domain) => !domain?.accountID});
    const [isRequestPending] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: (pendingActions) => !!pendingActions?.requestAdminship});
    const [requestError] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: (errors) => errors?.requestAdminshipError});

    // Tracks whether the user has submitted a request this visit, so navigating away on success doesn't also fire for a request that was already pending before the page mounted.
    const [hasSubmittedRequest, setHasSubmittedRequest] = useState(false);
    // The optimistic pending flag lands a render or two after the submit itself, so we can't treat "not pending yet" as "already settled" until we've actually seen it pending once.
    const [hasObservedPendingRequest, setHasObservedPendingRequest] = useState(false);
    const [prevIsRequestPending, setPrevIsRequestPending] = useState(isRequestPending);

    if (isRequestPending !== prevIsRequestPending) {
        setPrevIsRequestPending(isRequestPending);
        if (isRequestPending) {
            setHasObservedPendingRequest(true);
        }
    }

    const goToDomainsList = () => Navigation.goBack(ROUTES.DOMAINS_LIST.getRoute());

    useEffect(() => {
        if (!hasSubmittedRequest || isRequestPending || !hasObservedPendingRequest || requestError) {
            return;
        }
        goToDomainsList();
    }, [hasSubmittedRequest, isRequestPending, hasObservedPendingRequest, requestError]);

    useEffect(() => {
        return () => clearRequestAdminshipError(domainAccountID);
    }, [domainAccountID]);

    return (
        <ScreenWrapper testID="DomainAlreadyExistsPage">
            <HeaderWithBackButton
                title={translate('domain.domainAlreadyExists.headerTitle')}
                onBackButtonPress={goToDomainsList}
            />
            <ConfirmationPage
                illustration={EmptyStateDomainExists}
                illustrationStyle={styles.domainAlreadyExistsIllustrationStyle}
                heading={translate('domain.domainAlreadyExists.title')}
                innerContainerStyle={styles.p10}
                description={translate('domain.domainAlreadyExists.description')}
                descriptionStyle={styles.textSupporting}
                footerComponent={
                    !!requestError && (
                        <FormHelpMessage
                            message={getLatestErrorMessage({errors: requestError})}
                            style={styles.mb0}
                        />
                    )
                }
                shouldShowSecondaryButton
                secondaryButtonText={translate('domain.common.neverMind')}
                onSecondaryButtonPress={goToDomainsList}
                shouldShowButton
                buttonText={translate(hasPendingRequest ? 'domain.requestSent' : 'domain.domainAlreadyExists.requestAccess')}
                isButtonLoading={isRequestPending}
                isButtonDisabled={!isRequestPending && (!!hasPendingRequest || isOffline)}
                onButtonPress={() => {
                    if (!currentUserAccountID) {
                        return;
                    }
                    setHasSubmittedRequest(true);
                    requestDomainAdminship(domainAccountID, currentUserAccountID, !!isTransientDomainEntry);
                }}
            />
        </ScreenWrapper>
    );
}

export default DomainAlreadyExistsPage;
