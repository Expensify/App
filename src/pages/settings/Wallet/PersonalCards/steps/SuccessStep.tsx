import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function SuccessStep() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const exitFlow = () => {
        Navigation.dismissModal();
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
