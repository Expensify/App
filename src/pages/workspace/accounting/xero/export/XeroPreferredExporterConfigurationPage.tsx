import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAdminEmployees} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroPreferredExporterConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {export: exportConfiguration, pendingFields} = policy?.connections?.xero?.config ?? {};
    const exporters = getAdminEmployees(policy);
    const policyOwner = policy?.owner ?? '';

    const selectedExporter = useMemo(() => {
        const currentExporter = exporters.find((exporter) => exporter.email === exportConfiguration?.exporter);
        return currentExporter?.email ?? policyOwner;
    }, [exportConfiguration, exporters, policyOwner]);

    const policyID = policy?.id ?? '';

    return (
        <ConnectionLayout
            policyID={policyID}
            headerTitle="workspace.xero.preferredExporter"
            displayName={XeroPreferredExporterConfigurationPage.displayName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            title="workspace.xero.exportPreferredExporterNote"
            titleStyle={[styles.textLabelSupporting, styles.pb2]}
            subTitleStyle={styles.pb5}
            subtitle="workspace.xero.exportPreferredExporterSubNote"
            contentContainerStyle={[styles.ph5, styles.pb2]}
        >
            <OfflineWithFeedback pendingAction={pendingFields?.export}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={selectedExporter}
                    titleStyle={styles.textStrong}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={() => {
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.getRoute(policyID));
                    }}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

XeroPreferredExporterConfigurationPage.displayName = 'XeroPreferredExporterConfigurationPage';

export default withPolicyConnections(XeroPreferredExporterConfigurationPage);
