import type {ReactNode} from 'react';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FeedbackSurvey from '@components/FeedbackSurvey';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCancellationType from '@hooks/useCancellationType';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import * as Subscription from '@userActions/Subscription';
import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [isLoading, setIsLoading] = useState(false);

    const cancellationType = useCancellationType();

    const handleSubmit = (cancellationReason: FeedbackSurveyOptionID, cancellationNote = '') => {
        setIsLoading(true);
        Subscription.cancelBillingSubscription(cancellationReason, cancellationNote);
    };

    const acknowledgementText = useMemo(
        () => (
            <Text>
                {translate('subscription.requestEarlyCancellation.acknowledgement.part1')}
                <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>{translate('subscription.requestEarlyCancellation.acknowledgement.link')}</TextLink>
                {translate('subscription.requestEarlyCancellation.acknowledgement.part2')}
            </Text>
        ),
        [translate],
    );

    const manualCancellationContent = useMemo(
        () => (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.requestSubmitted.title')}</Text>
                    <Text style={[styles.mt1, styles.textNormalThemeText]}>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part1')}
                        <TextLink onPress={() => Report.navigateToConciergeChat()}>{translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.link')}</TextLink>
                        {translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle.part2')}
                    </Text>
                </View>
                <FixedFooter style={styles.ph0}>
                    <Button
                        success
                        text={translate('common.done')}
                        onPress={() => Navigation.goBack()}
                        large
                    />
                </FixedFooter>
            </View>
        ),
        [styles, translate],
    );

    const automaticCancellationContent = useMemo(
        () => (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.title')}</Text>
                    <Text style={[styles.mt1, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.subtitle')}</Text>
                    <Text style={[styles.mv4, styles.textNormalThemeText]}>{translate('subscription.requestEarlyCancellation.subscriptionCanceled.info')}</Text>
                    <Text>
                        {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.part1')}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}>
                            {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.link')}
                        </TextLink>
                        {translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity.part2')}
                    </Text>
                </View>
                <FixedFooter style={styles.ph0}>
                    <Button
                        success
                        text={translate('common.done')}
                        onPress={() => Navigation.goBack()}
                        large
                    />
                </FixedFooter>
            </View>
        ),
        [styles, translate],
    );

    const surveyContent = useMemo(
        () => (
            <FeedbackSurvey
                formID={ONYXKEYS.FORMS.REQUEST_EARLY_CANCELLATION_FORM}
                title={translate('subscription.subscriptionSettings.helpUsImprove')}
                description={translate('subscription.requestEarlyCancellation.subtitle')}
                onSubmit={handleSubmit}
                optionRowStyles={styles.flex1}
                footerText={<Text style={[styles.mb2, styles.mt4]}>{acknowledgementText}</Text>}
                isNoteRequired
                isLoading={isLoading}
                enabledWhenOffline={false}
            />
        ),
        [acknowledgementText, isLoading, styles.flex1, styles.mb2, styles.mt4, translate],
    );

    const contentMap: Partial<Record<CancellationType, ReactNode>> = {
        [CONST.CANCELLATION_TYPE.MANUAL]: manualCancellationContent,
        [CONST.CANCELLATION_TYPE.AUTOMATIC]: automaticCancellationContent,
    };

    const screenContent = cancellationType ? contentMap[cancellationType] : surveyContent;

    return (
        <ScreenWrapper
            testID={RequestEarlyCancellationPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('subscription.requestEarlyCancellation.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pt3]}>{screenContent}</ScrollView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';

export default RequestEarlyCancellationPage;
