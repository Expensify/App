import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceExporter} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {View} from 'react-native';

type ExporterListItem = ListItem & {
    value: string;
};

function CertiniaPreferredExporterPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const policyID = policy?.id;
    const {config} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_PREFERRED_EXPORTER.path);

    let data: ExporterListItem[];
    if (!isEmpty(policyOwner) && isEmpty(exporters)) {
        data = [
            {
                value: policyOwner,
                text: policyOwner,
                keyForList: policyOwner,
                isSelected: exportConfig?.exporter === policyOwner,
            },
        ];
    } else {
        data =
            exporters?.reduce<ExporterListItem[]>((options, exporter) => {
                if (!exporter.email) {
                    return options;
                }

                // Don't show guides if the current user is not a guide themselves or an Expensify employee
                if (isExpensifyTeam(exporter.email) && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                    return options;
                }

                options.push({
                    value: exporter.email,
                    text: exporter.email,
                    keyForList: exporter.email,
                    isSelected: (exportConfig?.exporter ?? policyOwner) === exporter.email,
                });
                return options;
            }, []) ?? [];
    }

    const headerContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
        </View>
    );

    const selectExporter = (row: ExporterListItem) => {
        if (row.value !== exportConfig?.exporter && policyID) {
            updateFinancialForceExporter(policyID, row.value, exportConfig?.exporter ?? '');
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaPreferredExporterPage"
            title="workspace.accounting.preferredExporter"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportConfig?.exporter}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.EXPORTER], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.EXPORTER)}
        />
    );
}

export default withPolicyConnections(CertiniaPreferredExporterPage);
