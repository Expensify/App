import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearFinancialForceErrorField, updateFinancialForceDefaultVendor} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type VendorListItem = ListItem & {
    value: string;
};

function CertiniaDefaultVendorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config, data} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const vendors = data?.vendors ?? [];
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_DEFAULT_VENDOR.path);

    const dataOptions: VendorListItem[] = useMemo(
        () =>
            vendors.map((vendor) => ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.id,
                isSelected: exportConfig?.vendorAccount === vendor.id,
            })),
        [exportConfig?.vendorAccount, vendors],
    );
    const listEmptyContent = (
        <View style={[styles.ph5, styles.pv5]}>
            <Text style={styles.textHeadlineH2}>{translate('workspace.certinia.noVendorsFound')}</Text>
            <Text style={[styles.mt2, styles.textLabelSupporting, styles.colorMuted]}>{translate('workspace.certinia.noVendorsFoundDescription')}</Text>
        </View>
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const selectVendor = useCallback(
        (row: VendorListItem) => {
            if (row.value !== exportConfig?.vendorAccount && policyID) {
                updateFinancialForceDefaultVendor(policyID, row.value, exportConfig?.vendorAccount ?? null);
            }
            goBack();
        },
        [exportConfig?.vendorAccount, goBack, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaDefaultVendorPage"
            data={dataOptions}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportConfig?.vendorAccount}
            onBackButtonPress={goBack}
            title="workspace.accounting.defaultVendor"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(CertiniaDefaultVendorPage);
