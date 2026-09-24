import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralDefaultVendor} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction, sortVendors} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type VendorListItem = ListItem & {
    value: string;
};

function BusinessCentralDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const defaultVendorID = businessCentralConfig?.export?.defaultVendorID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    // Business Central rejects documents for a vendor blocked for all transactions, so it can't be the fallback vendor
    const vendors = (policy?.connections?.businessCentral?.data?.vendors ?? []).filter((vendor) => vendor.blocked !== CONST.BUSINESS_CENTRAL_VENDOR_BLOCKED.ALL);
    const data: VendorListItem[] = sortVendors(vendors, localeCompare).map((vendor) => ({
        value: vendor.id,
        text: vendor.name,
        keyForList: vendor.id,
        isSelected: defaultVendorID === vendor.id,
    }));
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.defaultCompanyCardVendor.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.businessCentral.noVendorsFound')}
            subtitle={translate('workspace.businessCentral.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectVendor = (item: VendorListItem) => {
        if (item.value !== defaultVendorID && policyID) {
            updateBusinessCentralDefaultVendor(policyID, item.value, defaultVendorID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralDefaultVendorSelectPage"
            title="workspace.businessCentral.defaultCompanyCardVendor.label"
            data={filteredData}
            textInputOptions={{...textInputOptions, label: textInputOptions.label ? translate('workspace.vendors.findVendor') : undefined}}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={defaultVendorID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID)}
        />
    );
}

export default withPolicyConnections(BusinessCentralDefaultVendorSelectPage);
