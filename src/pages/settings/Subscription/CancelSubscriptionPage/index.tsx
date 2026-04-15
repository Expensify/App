import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FeedbackSurvey from '@components/FeedbackSurvey';
import FixedFooter from '@components/FixedFooter';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCancellationType from '@hooks/useCancellationType';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {cancelBillingSubscription} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import {canCancelSubscription} from '@libs/SubscriptionUtils';
import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function CancelSubscriptionPage() {
    const {environmentURL} = useEnvironment();
    const workspacesListRoute = `${environmentURL}/${ROUTES.WORKSPACES_LIST.route}`;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [privateSubscription, privateSubscriptionResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [firstDayFreeTrial, firstDayFreeTrialResult] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial, lastDayFreeTrialResult] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [userBillingFundID, userBillingFundIDResult] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [account, accountResult] = useOnyx(ONYXKEYS.ACCOUNT);
    const isLoadingEligibilityData = isLoadingOnyxValue(privateSubscriptionResult, firstDayFreeTrialResult, lastDayFreeTrialResult, userBillingFundIDResult, accountResult);

    const [formState] = useOnyx(ONYXKEYS.FORMS.CANCEL_SUBSCRIPTION_FORM);
    const [cancellationDetails, cancellationDetailsResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS);
    const isLoadingGuardData = isLoadingEligibilityData || isLoadingOnyxValue(cancellationDetailsResult);

    const cancellationTypeFromHook = useCancellationType();
    const isEligibleToCancel = canCancelSubscription(privateSubscription?.type, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID, account?.hasPurchases);

    // Falls back to reading cancellation details directly on remount (hook only detects array growth).
    // Skipped for eligible users so they see the survey, not a historical success screen.
    const resolvedCancellationType = useMemo(() => {
        if (cancellationTypeFromHook) {
            return cancellationTypeFromHook;
        }
        if (isEligibleToCancel || !cancellationDetails?.length) {
            return undefined;
        }
        const pendingManual = cancellationDetails.find((detail) => detail.cancellationType === CONST.CANCELLATION_TYPE.MANUAL && !detail.cancellationDate);
        if (pendingManual) {
            return CONST.CANCELLATION_TYPE.MANUAL;
        }
        const noneEntry = cancellationDetails.find((detail) => detail.cancellationType === CONST.CANCELLATION_TYPE.NONE);
        if (noneEntry) {
            return CONST.CANCELLATION_TYPE.NONE;
        }
        return CONST.CANCELLATION_TYPE.AUTOMATIC;
    }, [cancellationTypeFromHook, cancellationDetails, isEligibleToCancel]);

    const handleSubmit = (cancellationReason: FeedbackSurveyOptionID, cancellationNote = '') => {
        cancelBillingSubscription(cancellationReason, cancellationNote);
    };

    const acknowledgementText = useMemo(() => <RenderHTML html={translate('subscription.cancelSubscription.acknowledgement')} />, [translate]);

    const manualCancellationContent = useMemo(
        () => (
            <View style={[styles.flexGrow1, styles.justifyContentBetween, styles.mh5]}>
                <View>
                    <Text style={styles.textHeadline}>{translate('subscription.cancelSubscription.requestSubmitted.title')}</Text>
                    <View style={[styles.mt1, styles.renderHTML]}>
                        <RenderHTML html={translate('subscription.cancelSubscription.requestSubmitted.subtitle')} />
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
                    <Text style={styles.textHeadline}>{translate('subscription.cancelSubscription.subscriptionCanceled.title')}</Text>
                    <Text style={[styles.mt1, styles.textNormalThemeText]}>{translate('subscription.cancelSubscription.subscriptionCanceled.subtitle')}</Text>
                    <Text style={[styles.mv4, styles.textNormalThemeText]}>{translate('subscription.cancelSubscription.subscriptionCanceled.info')}</Text>

                    <RenderHTML html={translate('subscription.cancelSubscription.subscriptionCanceled.preventFutureActivity', workspacesListRoute)} />
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
                formID={ONYXKEYS.FORMS.CANCEL_SUBSCRIPTION_FORM}
                title={translate('subscription.subscriptionSettings.helpUsImprove')}
                description={translate('subscription.cancelSubscription.subtitle')}
                onSubmit={handleSubmit}
                optionRowStyles={styles.flex1}
                footerText={<Text style={[styles.mb2, styles.mt4]}>{acknowledgementText}</Text>}
                isNoteRequired
                isLoading={!!formState?.isLoading}
                enabledWhenOffline={false}
            />
        ),
        [acknowledgementText, formState?.isLoading, styles.flex1, styles.mb2, styles.mt4, translate],
    );

    const contentMap: Partial<Record<CancellationType, ReactNode>> = {
        [CONST.CANCELLATION_TYPE.MANUAL]: manualCancellationContent,
        [CONST.CANCELLATION_TYPE.AUTOMATIC]: automaticCancellationContent,
        [CONST.CANCELLATION_TYPE.NONE]: manualCancellationContent,
    };

    const screenContent = resolvedCancellationType ? contentMap[resolvedCancellationType] : surveyContent;

    if (isLoadingGuardData) {
        return <FullscreenLoadingIndicator reasonAttributes={{context: 'CancelSubscriptionPage'}} />;
    }

    return (
        <ScreenWrapper
            testID="CancelSubscriptionPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen={!resolvedCancellationType}
        >
            <FullPageNotFoundView shouldShow={!isEligibleToCancel && !resolvedCancellationType}>
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <HeaderWithBackButton
                        title={translate('subscription.cancelSubscription.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.pt3]}>{screenContent}</ScrollView>
                </DelegateNoAccessWrapper>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default CancelSubscriptionPage;
