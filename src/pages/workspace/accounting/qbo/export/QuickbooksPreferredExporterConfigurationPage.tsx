import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getAdminEmployees} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksPreferredExporterConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

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
                    isSelected: (qboConfig?.export?.exporter ?? policy?.owner) === exporter.email,
                });
                return options;
            }, []),
        [exporters, policy?.owner, currentUserLogin, qboConfig?.export?.exporter],
    );

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== qboConfig?.export?.exporter) {
                Connections.updatePolicyConnectionConfig(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    CONST.QUICKBOOKS_CONFIG.EXPORT,
                    {exporter: row.value},
                    {exporter: qboConfig?.export.exporter},
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.getRoute(policyID));
        },
        [qboConfig?.export, policyID],
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

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksPreferredExporterConfigurationPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={headerContent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))}
            onSelectRow={selectExporter}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_CONFIG.EXPORTER], qboConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.EXPORTER)}
        />
    );
}

QuickbooksPreferredExporterConfigurationPage.displayName = 'QuickbooksPreferredExporterConfigurationPage';

export default withPolicyConnections(QuickbooksPreferredExporterConfigurationPage);
