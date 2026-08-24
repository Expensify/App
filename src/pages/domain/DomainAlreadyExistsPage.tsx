import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

function DomainAlreadyExistsPage() {
    const {asset: EarthWithControls} = useMemoizedLazyAsset(() => loadIllustration('EarthWithControls'));
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
                buttonText={translate('domain.domainAlreadyExists.requestAccess')}
                isButtonDisabled
            />
        </ScreenWrapper>
    );
}

export default DomainAlreadyExistsPage;
