import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FeedbackSurvey from '@components/FeedbackSurvey';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // TODO: replace this with NVP_PRIVATE_CANCELLATION_DETAILS.cancellationType
    const [cancellationType, setCancellationType] = useState<CancellationType>(CONST.CANCELLATION_TYPE.MANUAL);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSubmit = (cancellationReason: FeedbackSurveyOptionID, cancellationNote = '') => {
        // TODO: call the CancelBillingSubscriptionNewDot API method
        setCancellationType(CONST.CANCELLATION_TYPE.AUTOMATIC);
    };

    const acknowledgmentText = (
        <Text>
            {translate('subscription.requestEarlyCancellation.acknowledgement.part1')}
            <TextLink href={CONST.TERMS_URL}>{translate('subscription.requestEarlyCancellation.acknowledgement.link')}</TextLink>
            {translate('subscription.requestEarlyCancellation.acknowledgement.part2')}
        </Text>
    );

    let screenContent: React.ReactNode;

    if (cancellationType === CONST.CANCELLATION_TYPE.MANUAL) {
        screenContent = (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.requestSubmitted.title')}</Text>
                    <Text style={[styles.mt1, styles.textNormalThemeText]}>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part1')}
                        <TextLink onPress={() => {}}>{translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.link')}</TextLink>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part2')}
                    </Text>
                </View>
                <FixedFooter>
                    <Button
                        success
                        text={translate('subscription.requestEarlyCancellation.submitButton')}
                        onPress={() => Navigation.goBack()}
                    />
                </FixedFooter>
            </View>
        );
    } else if (cancellationType === CONST.CANCELLATION_TYPE.AUTOMATIC) {
        screenContent = (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.subscriptionCancelled.title')}</Text>
                    <Text style={[styles.mt1, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCancelled.subtitle')}</Text>
                    <Text style={[styles.mv4, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCancelled.info')}</Text>
                    <Text>
                        {translate('subscription.requestEarlyCancellation.subscriptionCancelled.preventFutureActivity.part1')}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}>
                            {translate('subscription.requestEarlyCancellation.subscriptionCancelled.preventFutureActivity.link')}
                        </TextLink>
                        {translate('subscription.requestEarlyCancellation.subscriptionCancelled.preventFutureActivity.part2')}
                    </Text>
                </View>
                <FixedFooter>
                    <Button
                        success
                        text={translate('subscription.requestEarlyCancellation.submitButton')}
                        onPress={() => Navigation.goBack()}
                    />
                </FixedFooter>
            </View>
        );
    } else {
        screenContent = (
            <FeedbackSurvey
                title={translate('subscription.subscriptionSettings.helpUsImprove')}
                description={translate('subscription.requestEarlyCancellation.subtitle')}
                onSubmit={handleSubmit}
                optionRowStyles={styles.flex1}
                bottomText={<Text style={styles.mb2}>{acknowledgmentText}</Text>}
            />
        );
    }

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
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pt3]}>{screenContent}</ScrollView>
        </ScreenWrapper>
    );
}

RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';

export default RequestEarlyCancellationPage;
