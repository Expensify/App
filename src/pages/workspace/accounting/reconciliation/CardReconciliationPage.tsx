import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDefaultCardFeed from '@hooks/useDefaultCardFeed';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getAccountingIntegrationDisplayName, getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {getCardSettings, getConnectionBankAccountsForReconciliation} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {toggleContinuousReconciliation} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {TupleToUnion} from 'type-fest';

import {isExpensifyCardContinuousReconciliationEnabledSelector} from '@selectors/Card';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

type CardReconciliationPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>;

type AccountingConnectionName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES>;

function CardReconciliationPage({policy, route}: CardReconciliationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const {environmentURL} = useEnvironment();

    // Resolve the feed the same way the reconciliation account settings child page does. Picking the first fully-set-up
    // fund here instead would disagree with the child whenever the policy has more than one eligible fund, so the parent
    // could show one fund's settlement account while the child edited another's.
    const {fundID: effectiveDomainID, programKey} = useDefaultCardFeed(policyID);

    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${effectiveDomainID}`, {
        selector: isExpensifyCardContinuousReconciliationEnabledSelector,
    });
    const [continuousReconciliationPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${effectiveDomainID}`);
    const [currentConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${effectiveDomainID}`);
    const [reconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID}${effectiveDomainID}`);

    const [resolvedFundCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${effectiveDomainID}`);
    const resolvedCardSettings = getCardSettings(resolvedFundCardSettings, programKey);
    const paymentBankAccountID = resolvedCardSettings?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {connection} = route.params;
    const connectionName = getConnectionNameFromRouteParam(connection) as AccountingConnectionName;
    const autoSync = !!policy?.connections?.[connectionName]?.config?.autoSync?.enabled;
    const shouldShow = !!resolvedCardSettings?.paymentBankAccountID;

    const connectionBankAccounts = getConnectionBankAccountsForReconciliation(policy?.connections, connectionName);
    const bankAccountTitle = connectionBankAccounts.find((account) => account.id === reconciliationBankAccountID)?.name ?? '';

    const handleToggleContinuousReconciliation = (value: boolean) => {
        toggleContinuousReconciliation(effectiveDomainID, value, connectionName, currentConnectionName);
        if (value) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path));
        }
    };

    const accountingAdvancedSettingsLink = useMemo(() => {
        if (!policyID) {
            return '';
        }

        switch (connection) {
            case CONST.POLICY.CONNECTIONS.ROUTE.QBO:
                return `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection)}/${DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.path}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.XERO:
                return `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_AUTO_SYNC.path}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE:
                return `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection)}/${DYNAMIC_ROUTES.NETSUITE_AUTO_SYNC.path}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT:
                return `${environmentURL}/${ROUTES.POLICY_ACCOUNTING_CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC.getRoute(policyID)}`;
            default:
                return '';
        }
    }, [connection, policyID, environmentURL]);

    const fetchPolicyAccountingData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openPolicyAccountingPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (continuousReconciliation !== undefined) {
            return;
        }
        fetchPolicyAccountingData();
    }, [continuousReconciliation, fetchPolicyAccountingData]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!shouldShow}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="CardReconciliationPage"
            >
                <HeaderWithBackButton title={translate('workspace.accounting.cardReconciliation')} />
                <ScrollView
                    contentContainerStyle={styles.pb5}
                    addBottomSafeAreaPadding
                >
                    <ToggleSettingOptionRow
                        key={translate('workspace.accounting.continuousReconciliation')}
                        title={translate('workspace.accounting.continuousReconciliation')}
                        subtitle={translate('workspace.accounting.saveHoursOnReconciliation')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.accounting.continuousReconciliation')}
                        disabled={!autoSync}
                        isActive={!!continuousReconciliation}
                        onToggle={handleToggleContinuousReconciliation}
                        wrapperStyle={styles.ph5}
                        pendingAction={continuousReconciliationPendingAction}
                    />
                    {!autoSync && (
                        <View style={[styles.renderHTML, styles.ph5, styles.mt2]}>
                            <RenderHTML
                                html={translate(
                                    'workspace.accounting.enableContinuousReconciliation',
                                    accountingAdvancedSettingsLink,
                                    getAccountingIntegrationDisplayName(policy, connectionName, translate),
                                )}
                            />
                        </View>
                    )}
                    <OfflineWithFeedback pendingAction={continuousReconciliationPendingAction}>
                        {!!paymentBankAccountID && !!continuousReconciliation && (
                            <MenuItemWithTopDescription
                                style={styles.mt5}
                                title={bankAccountTitle}
                                description={translate('workspace.accounting.reconciliationAccount')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path))}
                            />
                        )}
                    </OfflineWithFeedback>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(CardReconciliationPage);
