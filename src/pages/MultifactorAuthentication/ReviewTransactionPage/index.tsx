import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Header from '@components/Header';
import {FreezeCardCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {fireAndForgetReportFraudulentTransaction, reportFraudulentTransaction} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';

import MultifactorAuthenticationAuthorizeTransactionActions from '@pages/MultifactorAuthentication/AuthorizeTransactionPage/AuthorizeTransactionActions';
import useForcedReviewScreen from '@pages/MultifactorAuthentication/useForcedReviewScreen';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {SeverityLevel} from '@sentry/react-native';

import * as Sentry from '@sentry/react-native';
import React, {useState} from 'react';
import {View} from 'react-native';

import ReviewTransactionContent from './ReviewTransactionContent';

function addBreadcrumb(message: string, data?: Record<string, string | number | boolean | undefined>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `[Fraud Review] ${message}`,
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_FRAUD_REVIEW_SCREEN,
        level,
        data,
    });
}

type ReviewTransactionPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.REVIEW_TRANSACTION>;

/** Forced review where the cardholder tells us whether they recognize a transaction declined as possible fraud */
function ReviewTransactionPage({route}: ReviewTransactionPageProps) {
    const transactionID = route.params.transactionID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isReportingFraud, setIsReportingFraud] = useState(false);

    const [transactionQueue] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW);
    const transaction = transactionQueue?.[transactionID];

    const {executeScenario} = useMultifactorAuthentication();

    const reportFraudAndClose = () => {
        addBreadcrumb('Back-out confirmed, reporting fraud', {transactionID}, 'warning');
        fireAndForgetReportFraudulentTransaction({transactionID});
        Navigation.closeRHPFlow();
    };

    const {isConfirmModalVisible, showConfirmModal, hideConfirmModal, confirmBackOut, allowNavigatingAway} = useForcedReviewScreen({
        transactionID,
        isTransactionPendingReview: !!transaction,
        isSubmitting: isReportingFraud,
        isShowingOutcome: false,
        onConfirmBackOut: reportFraudAndClose,
        addBreadcrumb,
    });

    const confirmRecognized = () => {
        addBreadcrumb('Recognized tapped', {transactionID});
        allowNavigatingAway();
        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVIEW_FRAUD_TRANSACTION, {
            transactionID,
        });
    };

    const reportFraud = () => {
        addBreadcrumb('Unrecognized tapped', {transactionID});
        setIsReportingFraud(true);
        reportFraudulentTransaction({transactionID}).then(({reason, httpStatusCode}) => {
            addBreadcrumb('Fraud report completed', {transactionID, reason, httpStatusCode});
            allowNavigatingAway();
            Navigation.closeRHPFlow();
        });
    };

    // This will briefly be true after the fraud report has succeeded and Onyx has removed the transaction
    // from state, but reportFraudulentTransaction has not yet resolved.
    if (!transaction) {
        if (!isReportingFraud) {
            addBreadcrumb('Transaction unavailable', {transactionID}, 'warning');
        }
        return (
            <ScreenWrapper testID={ReviewTransactionPage.displayName}>
                <Header>
                    <Header.BackButton onPress={() => Navigation.closeRHPFlow()} />
                    <Header.Title title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')} />
                </Header>
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID={ReviewTransactionPage.displayName}>
            <Header>
                <Header.BackButton onPress={showConfirmModal} />
                <Header.Title title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')} />
            </Header>
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <ScrollView style={styles.flex1}>
                        <ReviewTransactionContent transaction={transaction} />
                    </ScrollView>
                    <MultifactorAuthenticationAuthorizeTransactionActions
                        isLoading={isReportingFraud}
                        onAuthorize={confirmRecognized}
                        onDeny={reportFraud}
                        authorizeText={translate('multifactorAuthentication.fraudReview.recognizedButton')}
                        denyText={translate('multifactorAuthentication.fraudReview.unrecognizedButton')}
                    />
                    <FreezeCardCancelConfirmModal
                        isVisible={isConfirmModalVisible}
                        onConfirm={confirmBackOut}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

ReviewTransactionPage.displayName = 'ReviewTransactionPage';

export default ReviewTransactionPage;
