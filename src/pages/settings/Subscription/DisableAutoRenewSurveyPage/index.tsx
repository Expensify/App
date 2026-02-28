import React from 'react';
import FeedbackSurvey from '@components/FeedbackSurvey';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Subscription from '@userActions/Subscription';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function DisableAutoRenewSurveyPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = (key: FeedbackSurveyOptionID, additionalNote?: string) => {
        Subscription.updateSubscriptionAutoRenew(false, key, additionalNote);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID="DisableAutoRenewSurveyPage"
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
                    formID={ONYXKEYS.FORMS.DISABLE_AUTO_RENEW_SURVEY_FORM}
                    title={translate('subscription.subscriptionSettings.helpUsImprove')}
                    description={translate('subscription.subscriptionSettings.whatsMainReason')}
                    onSubmit={handleSubmit}
                    optionRowStyles={styles.flex1}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default DisableAutoRenewSurveyPage;
