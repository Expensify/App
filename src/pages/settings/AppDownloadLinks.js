import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useLocalize from '@hooks/useLocalize';
import AppDownloadLinksView from './AppDownloadLinksView';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function AppDownloadLinksPage() {
    const {translate} = useLocalize();
    return (
        <ScreenWrapper testID={AppDownloadLinksPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            />
            <AppDownloadLinksView />
        </ScreenWrapper>
    );
}

AppDownloadLinksPage.propTypes = propTypes;
AppDownloadLinksPage.displayName = 'AppDownloadLinksPage';

export default compose(withWindowDimensions, withLocalize)(AppDownloadLinksPage);
