import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {updateSageIntacctExporter} from '@userActions/connections/SageIntacct';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {View} from 'react-native';

type CardListItem = ListItem & {
    value: string;
};

function SageIntacctPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfiguration, pendingFields} = policy?.connections?.intacct?.config ?? {};
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER>>();
    const backTo = route.params?.backTo;

    const goBack = () => {
        Navigation.goBack(backTo ?? (policyID && createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))));
    };

    // Don't show guides if the current user is not a guide themselves or an Expensify employee
    const data: CardListItem[] =
        !isEmpty(policyOwner) && isEmpty(exporters)
            ? [
                  {
                      value: policyOwner,
                      text: policyOwner,
                      keyForList: policyOwner,
                      isSelected: exportConfiguration?.exporter === policyOwner,
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
                      isSelected: exportConfiguration?.exporter === exporter.email,
                  });
                  return options;
              }, []);

    const selectExporter = (row: CardListItem) => {
        if (row.value !== exportConfiguration?.exporter && policyID) {
            updateSageIntacctExporter(policyID, row.value, exportConfiguration?.exporter);
        }
        goBack();
    };

    const headerContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterNote')}</Text>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterSubNote')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctPreferredExporterPage"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={goBack}
            title="workspace.sageIntacct.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.EXPORTER], pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORTER)}
        />
    );
}

export default withPolicyConnections(SageIntacctPreferredExporterPage);
