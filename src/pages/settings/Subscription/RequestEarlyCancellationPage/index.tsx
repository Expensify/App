import type {ReactNode} from 'react';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FeedbackSurvey from '@components/FeedbackSurvey';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCancellationType from '@hooks/useCancellationType';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {cancelBillingSubscription} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationPage() {
    const {environmentURL} = useEnvironment();
    const workspacesListRoute = `${environmentURL}/${ROUTES.WORKSPACES_LIST.route}`;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [isLoading, setIsLoading] = useState(false);

    const cancellationType = useCancellationType();

    const handleSubmit = (cancellationReason: FeedbackSurveyOptionID, cancellationNote = '') => {
        setIsLoading(true);
        cancelBillingSubscription(cancellationReason, cancellationNote);
    };

    const acknowledgementText = useMemo(() => <RenderHTML html={translate('subscription.requestEarlyCancellation.acknowledgement')} />, [translate]);

    const manualCancellationContent = useMemo(
        () => (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.requestEarlyCancellation.requestSubmitted.title')}</Text>
                    <View style={[styles.mt1, styles.renderHTML]}>
                        <RenderHTML html={translate('subscription.requestEarlyCancellation.requestSubmitted.subtitle')} />
                    </View>
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

                    <RenderHTML html={translate('subscription.requestEarlyCancellation.subscriptionCanceled.preventFutureActivity', {workspacesListRoute})} />
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
        [styles, translate, workspacesListRoute],
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
        [CONST.CANCELLATION_TYPE.NONE]: manualCancellationContent,
    };

    const screenContent = cancellationType ? contentMap[cancellationType] : surveyContent;

    return (
        <ScreenWrapper
            testID="RequestEarlyCancellationPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen={!cancellationType}
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

export default RequestEarlyCancellationPage;
