import React from 'react';
import FeedbackSurvey from '@components/FeedbackSurvey';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';

function DisableAutoRenewSurveyPage() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const handleSubmit = () => {};

    return (
        <ScreenWrapper testID={DisableAutoRenewSurveyPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={isSmallScreenWidth}
                icon={Illustrations.CreditCardsNew}
            />
            <FeedbackSurvey
                title={translate('subscription.subscriptionSettings.disableAutoRenew')}
                description={translate('subscription.subscriptionSettings.whatsMainReason')}
                onSubmit={handleSubmit}
            />
        </ScreenWrapper>
    );
}

DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';

export default DisableAutoRenewSurveyPage;
