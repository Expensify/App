import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function ImTeacherUpdateEmailPage() {
    const illustrations = useMemoizedLazyIllustrations(['EmailAddress'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const contactMethodsRoute = `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.getRoute(ROUTES.I_AM_A_TEACHER)}`;

    return (
        <ScreenWrapper testID={ImTeacherUpdateEmailPage.displayName}>
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iAmATeacher')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <BlockingView
                linkTranslationKey="notFound.goBackHome"
                shouldEmbedLinkWithSubtitle
                icon={illustrations.EmailAddress}
                title={translate('teachersUnitePage.updateYourEmail')}
                CustomSubtitle={
                    <Text style={[styles.textAlignCenter]}>
                        <RenderHTML html={translate('teachersUnitePage.schoolMailAsDefault', {contactMethodsRoute})} />
                    </Text>
                }
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
