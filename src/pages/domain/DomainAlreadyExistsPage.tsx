import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {requestDomainAdminship} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {hasPendingAdminshipRequestSelector} from '@src/selectors/Domain';
import {accountIDSelector} from '@src/selectors/Session';

import React from 'react';

type DomainAlreadyExistsPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ALREADY_EXISTS>;

function DomainAlreadyExistsPage({route}: DomainAlreadyExistsPageProps) {
    const {domainAccountID} = route.params;
    const {asset: EarthWithControls} = useMemoizedLazyAsset(() => loadIllustration('EarthWithControls'));
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [hasPendingRequest] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: hasPendingAdminshipRequestSelector(currentUserAccountID)});
    // The add domain page drops the entry that came with the failure, so anything left here without an accountID only carries this flow.
    const [isTransientDomainEntry] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: (domain) => !domain?.accountID});

    const goToDomainsList = () => Navigation.goBack(ROUTES.DOMAINS_LIST.getRoute());

    return (
        <ScreenWrapper testID="DomainAlreadyExistsPage">
            <HeaderWithBackButton
                title={translate('domain.domainAlreadyExists.headerTitle')}
                onBackButtonPress={goToDomainsList}
            />
            <ConfirmationPage
                illustration={EarthWithControls}
                illustrationStyle={styles.emptyDomainListStaticIllustrationStyle}
                heading={translate('domain.domainAlreadyExists.title')}
                innerContainerStyle={styles.p10}
                description={translate('domain.domainAlreadyExists.description')}
                descriptionStyle={styles.textSupporting}
                shouldShowSecondaryButton
                secondaryButtonText={translate('domain.common.neverMind')}
                onSecondaryButtonPress={goToDomainsList}
                shouldShowButton
                buttonText={translate(hasPendingRequest ? 'domain.requestSent' : 'domain.domainAlreadyExists.requestAccess')}
                isButtonDisabled={hasPendingRequest}
                onButtonPress={() => {
                    if (!currentUserAccountID) {
                        return;
                    }
                    requestDomainAdminship(domainAccountID, currentUserAccountID, !!isTransientDomainEntry);
                    goToDomainsList();
                }}
            />
        </ScreenWrapper>
    );
}

export default DomainAlreadyExistsPage;
