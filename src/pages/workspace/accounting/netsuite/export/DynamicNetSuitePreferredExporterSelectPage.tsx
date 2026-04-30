import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteExporter} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function DynamicNetSuitePreferredExporterSelectPage({policy}: WithPolicyConnectionsProps) {
    const config = policy?.connections?.netsuite?.options.config;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const policyID = policy?.id;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.path);
    const data: CardListItem[] = useMemo(() => {
        if (!isEmpty(policyOwner) && isEmpty(exporters)) {
            return [
                {
                    value: policyOwner,
                    text: policyOwner,
                    keyForList: policyOwner,
                    isSelected: true,
                },
            ];
        }

        return exporters?.reduce<CardListItem[]>((options, exporter) => {
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
                isSelected: (config?.exporter ?? policyOwner) === exporter.email,
            });
            return options;
        }, []);
    }, [config?.exporter, exporters, policyOwner, currentUserLogin]);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== config?.exporter && policyID) {
                updateNetSuiteExporter(policyID, row.value, config?.exporter ?? '');
            }
            goBack();
        },
        [config?.exporter, policyID, goBack],
    );

    const headerContent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicNetSuitePreferredExporterSelectPage"
            data={data}
            listItem={RadioListItem}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={goBack}
            title="workspace.accounting.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.EXPORTER], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORTER)}
        />
    );
}

export default withPolicyConnections(DynamicNetSuitePreferredExporterSelectPage);
