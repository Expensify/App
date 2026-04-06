import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

function SuccessStep() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((route) => isFullScreenName(route.name));

    const goBack = () => {
        switch (topmostFullScreenRoute?.name) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    };

    const exitFlow = () => {
        goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID="SuccessStep"
        >
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={translate('personalCard.addPersonalCard')}
                    onBackButtonPress={exitFlow}
                />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <ConfirmationPage
                        heading={translate('personalCard.personalCardAdded')}
                        description={translate('personalCard.personalCardAddedDescription')}
                        shouldShowButton
                        buttonText={translate('common.continue')}
                        onButtonPress={exitFlow}
                        containerStyle={styles.h100}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SuccessStep;
