import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function DisableAutoRenewSurveyPage() {
    return (
        <ScreenWrapper
            testID={DisableAutoRenewSurveyPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';

export default DisableAutoRenewSurveyPage;
