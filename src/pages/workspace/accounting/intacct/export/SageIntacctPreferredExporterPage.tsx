import {isEmpty} from 'lodash';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAdminEmployees, isExpensifyTeam} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateSageIntacctExporter} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function SageIntacctPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyOwner = policy?.owner ?? '';
    const {export: exportConfiguration} = policy?.connections?.intacct?.config ?? {};
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const policyID = policy?.id ?? '-1';
    const data: CardListItem[] = useMemo(() => {
        if (!isEmpty(policyOwner) && isEmpty(exporters)) {
            return [
                {
                    value: policyOwner,
                    text: policyOwner,
                    keyForList: policyOwner,
                    isSelected: exportConfiguration?.exporter === policyOwner,
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
                isSelected: exportConfiguration?.exporter === exporter.email,
            });
            return options;
        }, []);
    }, [exportConfiguration, exporters, policyOwner, currentUserLogin]);

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportConfiguration?.exporter) {
                updateSageIntacctExporter(policyID, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID));
        },
        [policyID, exportConfiguration],
    );

    const headerContent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterNote')}</Text>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterSubNote')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctPreferredExporterPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={headerContent}
            onSelectRow={selectExporter}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
            title="workspace.sageIntacct.preferredExporter"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        />
    );
}

SageIntacctPreferredExporterPage.displayName = 'SageIntacctPreferredExporterPage';

export default withPolicyConnections(SageIntacctPreferredExporterPage);
