import React from 'react';
import FeedbackSurvey from '@components/FeedbackSurvey';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function DisableAutoRenewSurveyPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = () => {
        // TODO API call to submit feedback will be implemented in next phase
    };

    return (
        <ScreenWrapper
            testID={DisableAutoRenewSurveyPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSettings.disableAutoRenew')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pt3]}>
                <FeedbackSurvey
                    title={translate('subscription.subscriptionSettings.helpUsImprove')}
                    description={translate('subscription.subscriptionSettings.whatsMainReason')}
                    onSubmit={handleSubmit}
                    optionRowStyles={styles.flex1}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';

export default DisableAutoRenewSurveyPage;
