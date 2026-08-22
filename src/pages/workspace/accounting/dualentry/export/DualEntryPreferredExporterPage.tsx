import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryExporter} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {View} from 'react-native';

type ExporterListItem = ListItem & {
    value: string;
};

function DualEntryPreferredExporterPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const exporter = dualentryConfig?.export?.exporter ?? policyOwner;
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT.getRoute(policyID) : undefined;

    const data: ExporterListItem[] =
        policyOwner && isEmpty(exporters)
            ? [
                  {
                      value: policyOwner,
                      text: policyOwner,
                      keyForList: policyOwner,
                      isSelected: exporter === policyOwner,
                  },
              ]
            : (exporters?.reduce<ExporterListItem[]>((options, exporterItem) => {
                  if (!exporterItem.email) {
                      return options;
                  }

                  // Don't show guides if the current user is not a guide themselves or an Expensify employee
                  if (isExpensifyTeam(exporterItem.email) && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                      return options;
                  }

                  options.push({
                      value: exporterItem.email,
                      text: exporterItem.email,
                      keyForList: exporterItem.email,
                      isSelected: exporter === exporterItem.email,
                  });
                  return options;
              }, []) ?? []);

    const headerContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
        </View>
    );

    const selectExporter = (item: ExporterListItem) => {
        if (item.value !== exporter && policyID) {
            updateDualEntryExporter(policyID, item.value, exporter);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DualEntryPreferredExporterPage"
            title="workspace.accounting.preferredExporter"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exporter}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.EXPORTER], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.EXPORTER)}
        />
    );
}

export default withPolicyConnections(DualEntryPreferredExporterPage);
