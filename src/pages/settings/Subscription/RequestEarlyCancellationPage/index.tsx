import React from 'react';
import FeedbackSurvey from '@components/FeedbackSurvey';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Subscription from '@userActions/Subscription';
import type {FeedbackSurveyOptionID} from '@src/CONST';

function RequestEarlyCancellationPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = (key: FeedbackSurveyOptionID, additionalNote?: string) => {
        Subscription.updateSubscriptionAutoRenew(false, key, additionalNote);
        Navigation.goBack();
    };

    const acknowledgmentText = (
        <Text>
            {translate('subscription.requestEarlyCancellation.acknowledgement.part1')}
            <Text
                style={styles.textBlue}
                onPress={() => {}}
            >
                {translate('subscription.requestEarlyCancellation.acknowledgement.link')}
            </Text>
            {translate('subscription.requestEarlyCancellation.acknowledgement.part2')}
        </Text>
    );

    return (
        <ScreenWrapper
            testID={RequestEarlyCancellationPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('subscription.requestEarlyCancellation.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pt3]}>
                <FeedbackSurvey
                    title={translate('subscription.subscriptionSettings.helpUsImprove')}
                    description={translate('subscription.requestEarlyCancellation.subtitle')}
                    onSubmit={handleSubmit}
                    optionRowStyles={styles.flex1}
                    bottomText={<Text style={styles.mb2}>{acknowledgmentText}</Text>}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';

export default RequestEarlyCancellationPage;
