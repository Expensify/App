import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getAdminEmployees} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksDesktopPreferredExporterConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qbdConfig = policy?.connections?.quickbooksOnline?.config; // TODO: should be updated to use the new connections object
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {canUseNewDotQBD} = usePermissions();

    const policyID = policy?.id ?? '-1';
    const data: CardListItem[] = useMemo(
        () =>
            exporters?.reduce<CardListItem[]>((options, exporter) => {
                if (!exporter.email) {
                    return options;
                }

                // Don't show guides if the current user is not a guide themselves or an Expensify employee
                if (PolicyUtils.isExpensifyTeam(exporter.email) && !PolicyUtils.isExpensifyTeam(policy?.owner) && !PolicyUtils.isExpensifyTeam(currentUserLogin)) {
                    return options;
                }
                options.push({
                    value: exporter.email,
                    text: exporter.email,
                    keyForList: exporter.email,
                    isSelected: (qbdConfig?.export?.exporter ?? policy?.owner) === exporter.email,
                });
                return options;
            }, []),
        [exporters, policy?.owner, currentUserLogin, qbdConfig?.export?.exporter],
    );

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== qbdConfig?.export?.exporter) {
                QuickbooksDesktop.updateQuickbooksDesktopPreferredExporter(policyID, {exporter: row.value}, {exporter: qbdConfig?.export.exporter ?? ''});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER.getRoute(policyID));
        },
        [qbdConfig?.export, policyID],
    );

    const headerContent = useMemo(
        () => (
            <>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
            </>
        ),
        [translate, styles.ph5, styles.pb5],
    );

    const accessVariants = canUseNewDotQBD ? [] : [CONST.POLICY.ACCESS_VARIANTS.ADMIN];

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopPreferredExporterConfigurationPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={headerContent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))} // TODO: should be updated to use new routes
            onSelectRow={selectExporter}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO} // TODO: should be updated to use the new connection
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_CONFIG.EXPORT], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_CONFIG.EXPORT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_CONFIG.EXPORT)}
        />
    );
}

QuickbooksDesktopPreferredExporterConfigurationPage.displayName = 'QuickbooksDesktopPreferredExporterConfigurationPage';

export default withPolicyConnections(QuickbooksDesktopPreferredExporterConfigurationPage);
