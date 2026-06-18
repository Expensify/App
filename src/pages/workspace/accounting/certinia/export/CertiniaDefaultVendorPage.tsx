import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceDefaultVendor} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

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
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const dataOptions: VendorListItem[] = vendors.map((vendor) => ({
        value: vendor.id,
        text: vendor.name,
        keyForList: vendor.id,
        isSelected: exportConfig?.vendorAccount === vendor.id,
    }));
    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.certinia.noVendorsFound')}
            subtitle={translate('workspace.certinia.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectVendor = (row: VendorListItem) => {
        if (row.value !== exportConfig?.vendorAccount && policyID) {
            updateFinancialForceDefaultVendor(policyID, row.value, exportConfig?.vendorAccount ?? null);
        }
        Navigation.goBack(backPath);
    };

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
            onBackButtonPress={() => Navigation.goBack(backPath)}
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
