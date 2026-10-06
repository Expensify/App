/**
 * Builds the accounting listings for the Connections page and starts the accounting connect flows from them.
 * Must be rendered inside an AccountingContextProvider.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegration, getIntegrationLastSuccessfulDate, tryNavigateToSubmitWorkspaceUpgrade} from '@libs/PolicyUtils';

import {useAccountingActions, useAccountingState} from '@pages/workspace/accounting/AccountingContext';
import {getAccountingIntegrationData, getSynchronizationErrorMessage, isIntuitEnterpriseSuiteConnection} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import type {ConnectionListing, ConnectionStatus} from './types';

import {getSyncStatusMessage} from './utils';

// Listings only read an integration's title and icon. The setup flow inputs are read by `AccountingContext` when a flow starts.
const NO_REUSABLE_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false, campfire: false};

function useAccountingConnectionListings(policy: OnyxEntry<Policy>): ConnectionListing[] {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {translate, datetimeToRelative, getLocalDateFromDatetime} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {startIntegrationFlow} = useAccountingActions();
    const {activeIntegration, popoverAnchorRefs} = useAccountingState();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const accountingIcons = useMemoizedLazyExpensifyIcons([
        'IntacctSquare',
        'IntuitSquare',
        'QBOSquare',
        'XeroSquare',
        'NetSuiteSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
        'DualEntrySquare',
        'CampfireSquare',
        'BusinessCentralSquare',
    ]);

    if (!policyID) {
        return [];
    }

    const canUseBusinessCentralIntegration = isBetaEnabled(CONST.BETAS.BUSINESS_CENTRAL) || !!policy?.connections?.businessCentral;
    const accountingIntegrations = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.filter((name) => {
        if (name === CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL) {
            return canUseBusinessCentralIntegration;
        }
        return true;
    });

    const syncingIntegration = accountingIntegrations.find((integration) => integration === connectionSyncProgress?.connectionName);
    // HR providers write to the same sync progress key, so only an accounting sync counts here
    const accountingSyncProgress = syncingIntegration ? connectionSyncProgress : undefined;
    const isSyncInProgress = !!accountingSyncProgress && isConnectionInProgress(accountingSyncProgress, policy);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? syncingIntegration;
    const isIntuitEnterpriseSuiteSyncInProgress = isSyncInProgress && activeIntegration?.name === CONST.POLICY.CONNECTIONS.NAME.QBO && activeIntegration.isIntuitEnterpriseSuite === true;
    const isConnectedToIntuitEnterpriseSuite =
        connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBO && (isIntuitEnterpriseSuiteConnection(policy) || isIntuitEnterpriseSuiteSyncInProgress);

    const connect = (name: ConnectionName, isIntuitEnterpriseSuite?: boolean) => {
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        if (tryNavigateToSubmitWorkspaceUpgrade(policy, true, CONST.UPGRADE_FEATURE_INTRO_MAPPING.accounting.alias, ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))) {
            return;
        }
        startIntegrationFlow(
            connectedIntegration
                ? {name, isIntuitEnterpriseSuite, integrationToDisconnect: connectedIntegration, shouldDisconnectIntegrationBeforeConnecting: true}
                : {name, isIntuitEnterpriseSuite},
        );
    };

    const getConnectedStatus = (name: ConnectionName, title: string | undefined): ConnectionStatus => {
        const hasQBOExportError = name === CONST.POLICY.CONNECTIONS.NAME.QBO && shouldShowQBOReimbursableExportDestinationAccountError(policy);
        if (hasQBOExportError || getSynchronizationErrorMessage(policy, name, isSyncInProgress, translate, styles)) {
            return {isBroken: true, message: translate('workspace.connections.brokenConnection')};
        }
        // A new connection hasn't synced yet while its first sync runs, so the sync is checked first
        const syncStage = isSyncInProgress ? accountingSyncProgress?.stageInProgress : undefined;
        if (!syncStage && isConnectionUnverified(policy, name)) {
            return {isBroken: false, isSyncing: isSyncInProgress, message: translate('workspace.accounting.notSync')};
        }
        return {
            isBroken: false,
            isSyncing: isSyncInProgress,
            message: getSyncStatusMessage({
                syncingMessage: syncStage ? translate('workspace.accounting.connections.syncStageName', syncStage, title) : undefined,
                successfulDate: getIntegrationLastSuccessfulDate(
                    getLocalDateFromDatetime,
                    policy?.connections?.[name],
                    name === accountingSyncProgress?.connectionName ? accountingSyncProgress : undefined,
                ),
                translate,
                datetimeToRelative,
            }),
        };
    };

    const integrationOptions = accountingIntegrations.flatMap((name) => [
        {name, isIntuitEnterpriseSuite: name === CONST.POLICY.CONNECTIONS.NAME.QBO ? false : undefined},
        ...(name === CONST.POLICY.CONNECTIONS.NAME.QBO ? [{name, isIntuitEnterpriseSuite: true}] : []),
    ]);

    return integrationOptions.flatMap(({name, isIntuitEnterpriseSuite}) => {
        const integrationData = getAccountingIntegrationData(
            name,
            policyID,
            translate,
            NO_REUSABLE_CONNECTIONS,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            accountingIcons,
            undefined,
            undefined,
            isIntuitEnterpriseSuite,
            isBetaEnabled(CONST.BETAS.UNIFIED_CONNECTIONS),
        );
        if (!integrationData) {
            return [];
        }

        const key = isIntuitEnterpriseSuite ? CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE : name;
        const isConnected = name === connectedIntegration && !!isIntuitEnterpriseSuite === isConnectedToIntuitEnterpriseSuite;

        return {
            key,
            category: CONST.TAB.CONNECTIONS.ACCOUNTING,
            title: integrationData.title,
            icon: integrationData.icon,
            status: isConnected ? getConnectedStatus(name, integrationData.title) : undefined,
            // The Xero partner offer is for workspaces choosing their first accounting integration
            offer:
                name === CONST.POLICY.CONNECTIONS.NAME.XERO && !connectedIntegration
                    ? {onPress: canWrite ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO)) : undefined}
                    : undefined,
            onConnect: () => connect(name, isIntuitEnterpriseSuite),
            onConfigure: () => Navigation.navigate(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID)),
            registerConnectButton: (button) => {
                const anchorRef = popoverAnchorRefs?.current?.[key];
                if (!anchorRef) {
                    return;
                }
                anchorRef.current = button;
            },
        };
    });
}

export default useAccountingConnectionListings;
