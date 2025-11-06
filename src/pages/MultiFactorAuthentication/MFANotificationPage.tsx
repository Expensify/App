import React, {useCallback} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import UI_CONFIG_ROUTES from '@libs/MultifactorAuthentication/Biometrics/notifications';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type SCREENS from '@src/SCREENS';

type MultiFactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.NOTIFICATION>;

function MFANotificationPage({route}: MultiFactorAuthenticationNotificationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = useCallback(() => {
        Navigation.dismissModal();
    }, []);

    const {info} = useMultifactorAuthenticationContext();

    const data = UI_CONFIG_ROUTES[route.params.notificationType];

    const {headerTitle, title, content} = {headerTitle: info.title, title: info.title, content: info.message};

    if (!data) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={MFANotificationPage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={styles.flex1}>
                <BlockingView
                    icon={data.illustration}
                    contentFitImage="fill"
                    iconWidth={data.iconWidth}
                    iconHeight={data.iconHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={content}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.ph5}
                    testID={MFANotificationPage.displayName}
                />
            </View>
            <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                <Button
                    success
                    style={styles.flex1}
                    onPress={onGoBackPress}
                    text={translate('common.buttonConfirm')}
                />
            </View>
        </ScreenWrapper>
    );
}

MFANotificationPage.displayName = 'multiFactorAuthenticationNotificationPage';

export default MFANotificationPage;
