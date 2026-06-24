import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateXeroExportExporter} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

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
    const goBack = useCallback(() => {
        Navigation.goBack(policyID ? createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID)) : undefined);
    }, [policyID]);

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
                isSelected: (config?.export?.exporter ?? policyOwner) === exporter.email,
            });
            return options;
        }, []);
    }, [policyOwner, exporters, currentUserLogin, config?.export?.exporter]);

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== config?.export?.exporter && policyID) {
                updateXeroExportExporter(policyID, row.value, config?.export?.exporter);
            }
            goBack();
        },
        [policyID, config?.export?.exporter, goBack],
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
