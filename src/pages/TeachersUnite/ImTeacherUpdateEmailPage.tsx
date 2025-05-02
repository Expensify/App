import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function ImTeacherUpdateEmailPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={ImTeacherUpdateEmailPage.displayName}>
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iAmATeacher')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <BlockingView
                shouldShowLink
                shouldEmbedLinkWithSubtitle
                icon={Illustrations.EmailAddress}
                title={translate('teachersUnitePage.updateYourEmail')}
                subtitle={translate('teachersUnitePage.schoolMailAsDefault')}
                linkKey="teachersUnitePage.contactMethods"
                onLinkPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRouteWithoutParams()))}
                iconWidth={variables.signInLogoWidthLargeScreen}
                iconHeight={variables.signInLogoHeightLargeScreen}
            />
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    large
                    accessibilityLabel={translate('teachersUnitePage.updateEmail')}
                    text={translate('teachersUnitePage.updateEmail')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(Navigation.getActiveRouteWithoutParams()))}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ImTeacherUpdateEmailPage.displayName = 'ImTeacherUpdateEmailPage';

export default ImTeacherUpdateEmailPage;
