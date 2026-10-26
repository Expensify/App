/**
 * Which accounting integration is connected, whether it is syncing, and who exports.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {isConnectionUnverified} from '@libs/actions/connections';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import type {ConnectionLastSync, ConnectionName, Connections, NetSuiteConnection, PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

type AccountingConnectionName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES>;

type ConnectionWithLastSyncData = {
    lastSync?: ConnectionLastSync;
};

function getUberConnectionErrorDirectlyFromPolicy(policy: OnyxEntry<Policy>) {
    const receiptUber = policy?.receiptPartners?.uber;

    return !!receiptUber?.error;
}

/**
 * Whether the policy has active accounting integration connections.
 * `getCurrentConnectionName` only returns connections supported in NewDot.
 * `hasSupportedOnlyOnOldDotIntegration` detects connections that are supported only on OldDot.
 */
function hasAccountingConnections(policy: OnyxEntry<Policy>) {
    return !!getCurrentConnectionName(policy) || hasSupportedOnlyOnOldDotIntegration(policy);
}

function hasAccountingFeatureConnection(policy: OnyxEntry<Policy>) {
    return hasAccountingConnections(policy) || hasUnsupportedIntegration(policy);
}

function getIntegrationLastSuccessfulDate(
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
    connection?: Connections[keyof Connections],
    connectionSyncProgress?: PolicyConnectionSyncProgress,
) {
    let syncSuccessfulDate;
    if (!connection) {
        return undefined;
    }
    if ((connection as NetSuiteConnection)?.lastSyncDate) {
        syncSuccessfulDate = (connection as NetSuiteConnection)?.lastSyncDate;
    } else {
        syncSuccessfulDate = (connection as ConnectionWithLastSyncData)?.lastSync?.successfulDate;
    }

    const connectionSyncTimeStamp = getLocalDateFromDatetime(connectionSyncProgress?.timestamp).toISOString();

    if (
        connectionSyncProgress?.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        syncSuccessfulDate &&
        connectionSyncTimeStamp > getLocalDateFromDatetime(syncSuccessfulDate).toISOString()
    ) {
        syncSuccessfulDate = connectionSyncTimeStamp;
    }
    return syncSuccessfulDate;
}

function getAccountingConnectionNames(): AccountingConnectionName[] {
    return [...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES];
}

function isAccountingConnectionName(connectionName?: ConnectionName): connectionName is AccountingConnectionName {
    return connectionName !== undefined && getAccountingConnectionNames().some((accountingConnectionName) => accountingConnectionName === connectionName);
}

function getConnectedIntegration(policy: Policy | undefined, connectionNames: readonly ConnectionName[] = getAccountingConnectionNames()) {
    return connectionNames.find((integration) => !!policy?.connections?.[integration]);
}

function getValidConnectedIntegration(policy: Policy | undefined, connectionNames: readonly ConnectionName[] = getAccountingConnectionNames()) {
    return connectionNames.find((integration) => !!policy?.connections?.[integration] && !isConnectionUnverified(policy, integration));
}

function hasIntegrationAutoSync(policy: Policy | undefined, connectedIntegration?: ConnectionName) {
    if (!isAccountingConnectionName(connectedIntegration)) {
        return false;
    }

    return policy?.connections?.[connectedIntegration]?.config?.autoSync?.enabled ?? false;
}

function hasUnsupportedIntegration(policy: Policy | undefined) {
    return Object.values(CONST.POLICY.CONNECTIONS.UNSUPPORTED_NAMES).some((integration) => !!(policy?.connections as Record<string, unknown>)?.[integration]);
}

function hasSupportedOnlyOnOldDotIntegration(policy: Policy | undefined) {
    return Object.values(CONST.POLICY.CONNECTIONS.SUPPORTED_ONLY_ON_OLDDOT as Record<string, string>).some(
        (integration) => !!(policy?.connections as Record<string, unknown>)?.[integration],
    );
}

function getCurrentConnectionName(policy: Policy | undefined): string | undefined {
    const accountingIntegrations = getAccountingConnectionNames();
    const connectionKey = accountingIntegrations.find((integration) => !!policy?.connections?.[integration]);
    return connectionKey ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionKey] : undefined;
}

function isPreferredExporter(policy: Policy, currentUserLogin: string) {
    const exporters = getConnectionExporters(policy);

    return exporters.some((exporter) => exporter && exporter === currentUserLogin);
}

/**
 * Returns an array of connection exporters from the policy's accounting integrations
 */
function getConnectionExporters(policy: OnyxInputOrEntry<Policy>): Array<string | undefined> {
    return [
        policy?.connections?.intacct?.config?.export?.exporter,
        policy?.connections?.quickbooksDesktop?.config?.export?.exporter,
        policy?.connections?.quickbooksOnline?.config?.export?.exporter,
        policy?.connections?.xero?.config?.export?.exporter,
        policy?.connections?.netsuite?.options?.config?.exporter,
        policy?.connections?.rillet?.config?.export?.exporter,
        policy?.connections?.dualEntry?.config?.export?.exporter,
        policy?.connections?.campfire?.config?.export?.exporter,
        policy?.connections?.businessCentral?.config?.export?.exporter,
    ];
}

export {
    getAccountingConnectionNames,
    getUberConnectionErrorDirectlyFromPolicy,
    hasAccountingConnections,
    hasAccountingFeatureConnection,
    getIntegrationLastSuccessfulDate,
    getConnectedIntegration,
    getValidConnectedIntegration,
    hasIntegrationAutoSync,
    hasSupportedOnlyOnOldDotIntegration,
    getCurrentConnectionName,
    isPreferredExporter,
    getConnectionExporters,
};
