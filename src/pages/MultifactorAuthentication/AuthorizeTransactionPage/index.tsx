import type {SeverityLevel} from '@sentry/react-native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {AuthorizeTransactionCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import ScenarioConfigs from '@components/MultifactorAuthentication/config/scenarios';
import {
    AlreadyReviewedFailureScreen,
    DeniedTransactionServerFailureScreen,
    DeniedTransactionSuccessScreen,
} from '@components/MultifactorAuthentication/config/scenarios/AuthorizeTransaction';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {denyTransaction, fireAndForgetDenyTransaction} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
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

    const {isOffline} = useNetworkWithOfflineStatus();

    const [isDenyingTransaction, setIsDenyingTransaction] = useState(false);
    const [denyOutcomeScreen, setDenyOutcomeScreen] = useState<React.ReactElement | null>(null);

    const [transactionQueue] = useOnyx(ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW);
    const transaction = transactionQueue?.[transactionID];

    const {executeScenario} = useMultifactorAuthentication();

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const allowNavigatingAwayRef = useRef(false);

    const showConfirmModal = useCallback(() => {
        // FullPageOfflineBlockingView doesn't wrap HeaderWithBackButton, so we handle navigation manually when offline.
        // Offline mode isn't supported in MFA; navigate users away immediately without showing the confirmation modal.
        if (isOffline) {
            addBreadcrumb('Offline back-navigation (no deny sent)', {transactionID}, 'warning');
            allowNavigatingAwayRef.current = true;
            Navigation.closeRHPFlow();
            return;
        }
        setConfirmModalVisibility(true);
    }, [isOffline, transactionID]);

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const onBeforeRemove: Parameters<typeof useBeforeRemove>[0] = (e) => {
        if (allowNavigatingAwayRef.current || !transaction || !!denyOutcomeScreen) {
            return;
        }
        e.preventDefault();
        showConfirmModal();
    };

    useBeforeRemove(onBeforeRemove);

    const onApproveTransaction = () => {
        addBreadcrumb('Approve tapped', {transactionID});
        allowNavigatingAwayRef.current = true;
        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {
            transactionID,
        });
    };

    const onDenyTransaction = () => {
        addBreadcrumb('Deny tapped', {transactionID});
        setIsDenyingTransaction(true);
        denyTransaction({transactionID}).then(({reason, httpStatusCode, message}) => {
            addBreadcrumb('Deny completed', {transactionID, reason, httpStatusCode, message});
            if (reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TRANSACTION_DENIED) {
                setDenyOutcomeScreen(<DeniedTransactionSuccessScreen />);
                return;
            }
            setDenyOutcomeScreen(authorizeTransactionConfig.failureScreens[reason] ?? <DeniedTransactionServerFailureScreen />);
        });
    };

    const onSilentlyDenyTransaction = () => {
        addBreadcrumb('Silent deny (user canceled flow)', {transactionID}, 'warning');
        fireAndForgetDenyTransaction({transactionID});
        setConfirmModalVisibility(false);
        allowNavigatingAwayRef.current = true;
        Navigation.closeRHPFlow();
    };

    if (denyOutcomeScreen) {
        return <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>{denyOutcomeScreen}</ScreenWrapper>;
    }

    if (!transaction) {
        addBreadcrumb('Transaction unavailable', {transactionID, isDenyingTransaction}, 'warning');
        // isDenyingTransaction is handled here because:
        // When the transaction denial succeeds, the transaction gets removed from the queue slightly sooner than denyTransaction resolves.
        // We handle this case specially here so that the user does not see a momentary flash of the AlreadyReviewedFailureScreen
        return (
            <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>
                {isDenyingTransaction ? <DeniedTransactionSuccessScreen /> : <AlreadyReviewedFailureScreen />}
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
                        onConfirm={onSilentlyDenyTransaction}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName = 'MultifactorAuthenticationScenarioAuthorizeTransactionPage';

export default MultifactorAuthenticationScenarioAuthorizeTransactionPage;
