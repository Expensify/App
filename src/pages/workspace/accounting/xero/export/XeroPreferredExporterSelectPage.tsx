import React, { useCallback, useMemo } from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type { ListItem } from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import { getAdminEmployees } from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type { WithPolicyConnectionsProps } from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';


type CardListItem = ListItem & {
    value: string;
};

function XeroPreferredExporterSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {export: exportConfiguration} = policy?.connections?.xero?.config ?? {};
    const exporters = getAdminEmployees(policy);

    const policyID = policy?.id ?? '';
    const data: CardListItem[] = useMemo(
        () =>
            exporters?.reduce<CardListItem[]>((vendors, vendor) => {
                if (vendor.email) {
                    vendors.push({
                        value: vendor.email,
                        text: vendor.email,
                        keyForList: vendor.email,
                        isSelected: exportConfiguration?.exporter === vendor.email,
                    });
                }
                return vendors;
            }, []),
        [exportConfiguration, exporters],
    );

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportConfiguration?.exporter) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.EXPORT, {exporter: row.value});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID));
        },
        [policyID, exportConfiguration],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={XeroPreferredExporterSelectPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.preferredExporter')} />
                <SelectionList
                    headerContent={
                        <>
                            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportPreferredExporterNote')}</Text>
                            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportPreferredExporterSubNote')}</Text>
                        </>
                    }
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={selectExporter}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroPreferredExporterSelectPage.displayName = 'XeroPreferredExporterSelectPage';

export default withPolicyConnections(XeroPreferredExporterSelectPage);