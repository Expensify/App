import {useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAdminEmployees, isExpensifyTeam, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateXeroExportExporter} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CardListItem = ListItem & {
    value: string;
};

function XeroPreferredExporterSelectPage({policy}: WithPolicyConnectionsProps) {
    const {config} = policy?.connections?.xero ?? {};
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT>>();
    const backTo = route.params?.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);

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
            displayName="XeroPreferredExporterSelectPage"
            data={data}
            listItem={RadioListItem}
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

export default withPolicyConnections(XeroPreferredExporterSelectPage);
