import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlinePreferredExporter} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksPreferredExporterConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER>>();
    const backTo = route.params?.backTo;

    const policyID = policy?.id;
    const data: CardListItem[] = useMemo(
        () =>
            exporters?.reduce<CardListItem[]>((options, exporter) => {
                if (!exporter.email) {
                    return options;
                }

                // Don't show guides if the current user is not a guide themselves or an Expensify employee
                if (isExpensifyTeam(exporter.email) && !isExpensifyTeam(policy?.owner) && !isExpensifyTeam(currentUserLogin)) {
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

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID));
    }, [policyID, backTo]);

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== qboConfig?.export?.exporter) {
                updateQuickbooksOnlinePreferredExporter(policyID, {exporter: row.value}, {exporter: qboConfig?.export?.exporter ?? ''});
            }
            goBack();
        },
        [qboConfig?.export, policyID, goBack],
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
            displayName="QuickbooksPreferredExporterConfigurationPage"
            data={data}
            listItem={RadioListItem}
            headerContent={headerContent}
            onBackButtonPress={goBack}
            onSelectRow={selectExporter}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.EXPORT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.EXPORT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.EXPORT)}
        />
    );
}

export default withPolicyConnections(QuickbooksPreferredExporterConfigurationPage);
