import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {updateXeroExportExporter} from '@userActions/connections/Xero';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {View} from 'react-native';

type CardListItem = ListItem & {
    value: string;
};

function DynamicXeroPreferredExporterSelectPage({policy}: WithPolicyConnectionsProps) {
    const {config} = policy?.connections?.xero ?? {};
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const policyID = policy?.id;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.path);
    const goBack = () => {
        Navigation.goBack(backPath);
    };

    // Don't show guides if the current user is not a guide themselves or an Expensify employee
    const data: CardListItem[] =
        !isEmpty(policyOwner) && isEmpty(exporters)
            ? [
                  {
                      value: policyOwner,
                      text: policyOwner,
                      keyForList: policyOwner,
                      isSelected: true,
                  },
              ]
            : exporters?.reduce<CardListItem[]>((options, exporter) => {
                  if (!exporter.email) {
                      return options;
                  }
                  if (isExpensifyTeam(exporter.email) && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                      return options;
                  }
                  options.push({
                      value: exporter.email,
                      text: exporter.email,
                      keyForList: exporter.email,
                      isSelected: (config?.export?.exporter ?? policyOwner) === exporter.email,
                  });
                  return options;
              }, []);

    const selectExporter = (row: CardListItem) => {
        if (row.value !== config?.export?.exporter && policyID) {
            updateXeroExportExporter(policyID, row.value, config?.export?.exporter);
        }
        goBack();
    };

    const headerContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicXeroPreferredExporterSelectPage"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={goBack}
            title="workspace.accounting.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.EXPORTER], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.EXPORTER)}
        />
    );
}

export default withPolicyConnections(DynamicXeroPreferredExporterSelectPage);
