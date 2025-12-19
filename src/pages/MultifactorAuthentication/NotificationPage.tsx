import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.NOTIFICATION>;

function MultifactorAuthenticationNotificationPage({route}: MultifactorAuthenticationNotificationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => {
        Navigation.dismissModal();
    };

    const {info} = useMultifactorAuthenticationContext();

    const data = MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP[route.params.notificationType];

    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(data.illustration));

    const {headerTitle, title, description} = info;

    if (!data) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={MultifactorAuthenticationNotificationPage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={styles.flex1}>
                <BlockingView
                    icon={icon}
                    contentFitImage="fill"
                    iconWidth={data.iconWidth}
                    iconHeight={data.iconHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={description}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.ph5}
                    testID={MultifactorAuthenticationNotificationPage.displayName}
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

MultifactorAuthenticationNotificationPage.displayName = 'MultifactorAuthenticationNotificationPage';

export default MultifactorAuthenticationNotificationPage;
