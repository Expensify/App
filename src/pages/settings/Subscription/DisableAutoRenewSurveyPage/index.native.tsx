import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function DisableAutoRenewSurveyPage() {
    return (
        <ScreenWrapper
            testID="DisableAutoRenewSurveyPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default DisableAutoRenewSurveyPage;
