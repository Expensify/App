import React from 'react';
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
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAddedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ADDED>;

function DomainAddedPage({route}: DomainAddedPageProps) {
    const {asset: Encryption} = useMemoizedLazyAsset(() => loadIllustration('Encryption'));
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const domainAccountID = route.params.domainAccountID;
    const [isAdmin, isAdminResults] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainAccountID}`, {canBeMissing: true});

    if (isLoadingOnyxValue(isAdminResults)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!isAdmin) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <ScreenWrapper testID="DomainAddedPage">
            <HeaderWithBackButton title={translate('domain.domainAdded.title')} />
            <ConfirmationPage
                illustration={Encryption}
                heading={translate('domain.domainAdded.title')}
                innerContainerStyle={styles.p10}
                description={translate('domain.domainAdded.description')}
                descriptionStyle={styles.textSupporting}
                buttonText={translate('domain.domainAdded.configure')}
                shouldShowButton
                onButtonPress={() => Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID))}
            />
        </ScreenWrapper>
    );
}

export default DomainAddedPage;
