import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {AuthorizeTransactionCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import ScenarioConfigs from '@components/MultifactorAuthentication/config/scenarios';
import {DeniedTransactionServerFailureScreen, DeniedTransactionSuccessScreen} from '@components/MultifactorAuthentication/config/scenarios/AuthorizeTransaction';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {denyTransaction, fireAndForgetDenyTransaction} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';

import useForcedReviewScreen from '@pages/MultifactorAuthentication/useForcedReviewScreen';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {SeverityLevel} from '@sentry/react-native';

import * as Sentry from '@sentry/react-native';
import React, {useState} from 'react';
import {View} from 'react-native';

import MultifactorAuthenticationAuthorizeTransactionActions from './AuthorizeTransactionActions';
import MultifactorAuthenticationAuthorizeTransactionContent from './AuthorizeTransactionContent';

function addBreadcrumb(message: string, data?: Record<string, string | number | boolean | undefined>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `[3DS Authorize] ${message}`,
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_3DS_AUTHORIZE,
        level,
        data,
    });
}

type MultifactorAuthenticationAuthorizeTransactionPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION>;

const authorizeTransactionConfig = ScenarioConfigs[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION];

function MultifactorAuthenticationScenarioAuthorizeTransactionPage({route}: MultifactorAuthenticationAuthorizeTransactionPageProps) {
    const transactionID = route.params.transactionID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isDenyingTransaction, setIsDenyingTransaction] = useState(false);
    const [denyOutcomeScreen, setDenyOutcomeScreen] = useState<React.ReactElement | null>(null);

    const [transactionQueue] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW);
    const transaction = transactionQueue?.[transactionID];

    const {executeScenario} = useMultifactorAuthentication();

    const onSilentlyDenyTransaction = () => {
        addBreadcrumb('Silent deny (user canceled flow)', {transactionID}, 'warning');
        fireAndForgetDenyTransaction({transactionID});
        Navigation.closeRHPFlow();
    };

    const {isConfirmModalVisible, showConfirmModal, hideConfirmModal, confirmBackOut, allowNavigatingAway} = useForcedReviewScreen({
        transactionID,
        isTransactionPendingReview: !!transaction,
        isSubmitting: isDenyingTransaction,
        isShowingOutcome: !!denyOutcomeScreen,
        onConfirmBackOut: onSilentlyDenyTransaction,
        addBreadcrumb,
    });

    const onApproveTransaction = () => {
        addBreadcrumb('Approve tapped', {transactionID});
        allowNavigatingAway();
        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {
            transactionID,
        });
    };

    const onDenyTransaction = () => {
        addBreadcrumb('Deny tapped', {transactionID});
        setIsDenyingTransaction(true);
        denyTransaction({transactionID}).then(({reason, httpStatusCode, message}) => {
            addBreadcrumb('Deny completed', {transactionID, reason, httpStatusCode, message});
            // The deny outcome is rendered inside this RHP page (not inside the MFA modal navigator),
            // so the outcome screen's default CLOSE_MODAL dispatch has no effect here. Override its
            // close handler to dismiss the RHP instead.
            const closeRHP = () => {
                allowNavigatingAway();
                Navigation.closeRHPFlow();
            };
            if (reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED) {
                setDenyOutcomeScreen(<DeniedTransactionSuccessScreen onClose={closeRHP} />);
                return;
            }
            const failureElement = reason ? authorizeTransactionConfig.failureScreens[reason] : undefined;
            const failureWithCloseOverride = failureElement ? React.cloneElement(failureElement, {onClose: closeRHP}) : <DeniedTransactionServerFailureScreen onClose={closeRHP} />;
            setDenyOutcomeScreen(failureWithCloseOverride);
        });
    };

    if (denyOutcomeScreen) {
        return <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>{denyOutcomeScreen}</ScreenWrapper>;
    }

    // This will briefly be true after the transaction deny call has succeeded and Onyx has removed the transaction
    // from state, but denyTransaction has not yet resolved. If we reach this case and isDenyingTransaction isn't
    // true, then something unexpected has happened (we should've navigated away due to the useEffect above)
    if (!transaction) {
        if (!isDenyingTransaction) {
            addBreadcrumb('Transaction unavailable', {transactionID}, 'warning');
        }
        return (
            <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>
                <HeaderWithBackButton
                    title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')}
                    onBackButtonPress={() => {
                        Navigation.closeRHPFlow();
                    }}
                    shouldShowBackButton
                />
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <MultifactorAuthenticationAuthorizeTransactionContent transaction={transaction} />
                    <MultifactorAuthenticationAuthorizeTransactionActions
                        isLoading={isDenyingTransaction}
                        onAuthorize={onApproveTransaction}
                        onDeny={onDenyTransaction}
                    />
                    <AuthorizeTransactionCancelConfirmModal
                        isVisible={isConfirmModalVisible}
                        onConfirm={confirmBackOut}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName = 'MultifactorAuthenticationScenarioAuthorizeTransactionPage';

export default MultifactorAuthenticationScenarioAuthorizeTransactionPage;
