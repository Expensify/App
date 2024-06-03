import React from 'react';
import FeedbackSurvey from '@components/FeedbackSurvey';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function DisableAutoRenewSurveyPage() {
    const {translate} = useLocalize();

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
            <FeedbackSurvey
                title={translate('subscription.subscriptionSettings.helpUsImprove')}
                description={translate('subscription.subscriptionSettings.whatsMainReason')}
                onSubmit={handleSubmit}
            />
        </ScreenWrapper>
    );
}

DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';

export default DisableAutoRenewSurveyPage;
