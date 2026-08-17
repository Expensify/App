import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
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
import {domainNameSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

type DomainAlreadyExistsPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ALREADY_EXISTS>;

function DomainAlreadyExistsPage({route}: DomainAlreadyExistsPageProps) {
    const {asset: GlobeLock} = useMemoizedLazyAsset(() => loadIllustration('GlobeLock'));
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const domainAccountID = route.params.domainAccountID;
    // TODO: the BE only sends this domain_<domainAccountID> entry because CreateDomain failed with
    // "already exists" - the current user has no access to it, so it's not real data. Once "Request access"
    // lands, getDomainForOnyx will start sending the requester's own pending-request state through this same
    // key, so cleaning it up here (e.g. on unmount) could wipe that state right after the user requests access.
    const [domainName, domainNameResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    const goToDomainsList = () => Navigation.goBack(ROUTES.DOMAINS_LIST.getRoute());

    const isDomainNameLoading = isLoadingOnyxValue(domainNameResults);
    if (isDomainNameLoading) {
        return <FullScreenLoadingIndicator />;
    }

    if (!domainName) {
        return <NotFoundPage onLinkPress={goToDomainsList} />;
    }

    return (
        <ScreenWrapper testID="DomainAlreadyExistsPage">
            <HeaderWithBackButton
                title={translate('domain.domainAlreadyExists.headerTitle')}
                onBackButtonPress={goToDomainsList}
            />
            <ConfirmationPage
                illustration={GlobeLock}
                heading={translate('domain.domainAlreadyExists.title')}
                innerContainerStyle={styles.p10}
                description={translate('domain.domainAlreadyExists.description')}
                descriptionStyle={styles.textSupporting}
                shouldShowSecondaryButton
                secondaryButtonText={translate('domain.domainAlreadyExists.neverMind')}
                onSecondaryButtonPress={goToDomainsList}
                shouldShowButton
                buttonText={translate('domain.domainAlreadyExists.requestAccess')}
                onButtonPress={() => {
                    // TODO: call the BE "request domain admin access" endpoint for domainAccountID once it exists.
                    goToDomainsList();
                }}
            />
        </ScreenWrapper>
    );
}

export default DomainAlreadyExistsPage;
