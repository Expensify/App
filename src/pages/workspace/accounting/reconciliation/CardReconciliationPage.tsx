import CardFeedIcon from '@components/CardFeedIcon';
import FeedSelector from '@components/FeedSelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReconciliationFundID from '@hooks/useReconciliationFundID';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {getAccountingIntegrationDisplayName, getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {getCardSettings, getConnectionBankAccountsForReconciliation, isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import variables from '@styles/variables';

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

    // Continuous Reconciliation is configured per card feed, and this workspace can sit on more than one: its own
    // workspace-provisioned feed plus any domain or other-workspace feed that lists it as preferred or linked. The
    // candidates are the feeds the admin may configure from here; the selected one comes from the route, defaulting to
    // the feed useDefaultFundID resolves.
    const {candidates, fundID: effectiveDomainID} = useReconciliationFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${effectiveDomainID}`);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const selectedFeedName = getExpensifyCardFeedDescription(cardSettings, policies, domains, effectiveDomainID, cardList);

    // With a single candidate there is nothing to choose, so the selector is hidden. The feed can still be owned by a
    // domain or another workspace, in which case toggling Continuous Reconciliation here also changes it for every
    // other policy on that feed, so name the feed the setting will apply to.
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const shouldShowFeedSelector = candidates.length > 1;
    const isFeedOwnedElsewhere = !!selectedFeedName && effectiveDomainID !== workspaceAccountID;
    const shouldShowSharedFeedNote = !shouldShowFeedSelector && isFeedOwnedElsewhere;

    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${effectiveDomainID}`, {
        selector: isExpensifyCardContinuousReconciliationEnabledSelector,
    });
    const [continuousReconciliationPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${effectiveDomainID}`);
    const [currentConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${effectiveDomainID}`);
    const [reconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID}${effectiveDomainID}`);

    const resolvedCardSettings = getCardSettings(cardSettings);
    const paymentBankAccountID = resolvedCardSettings?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {connection} = route.params;
    const connectionName = getConnectionNameFromRouteParam(connection) as AccountingConnectionName;
    const autoSync = !!policy?.connections?.[connectionName]?.config?.autoSync?.enabled;
    const shouldShow = isExpensifyCardFullySetUp(policy, cardSettings);

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
                    {shouldShowFeedSelector && (
                        <View style={[styles.ph5, styles.pb3]}>
                            <FeedSelector
                                onFeedSelect={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_SELECT_FEED.path))}
                                CardFeedIcon={
                                    <CardFeedIcon
                                        isExpensifyCardFeed
                                        iconProps={{
                                            height: variables.cardIconHeight,
                                            width: variables.cardIconWidth,
                                            additionalStyles: styles.cardIcon,
                                        }}
                                    />
                                }
                                feedName={translate('workspace.common.expensifyCard')}
                                supportingText={selectedFeedName}
                            />
                        </View>
                    )}
                    {shouldShowFeedSelector && (
                        <View style={[styles.renderHTML, styles.ph5, styles.pb3]}>
                            <RenderHTML html={translate('workspace.accounting.continuousReconciliationFeedSelection')} />
                        </View>
                    )}
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
                    {shouldShowSharedFeedNote && (
                        <View style={[styles.renderHTML, styles.ph5, styles.mt2]}>
                            <RenderHTML html={translate('workspace.accounting.continuousReconciliationSharedFeed', selectedFeedName)} />
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
