import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryDefaultVendor} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DualEntryVendor} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type VendorListItem = ListItem & {
    value: DualEntryVendor['id'];
};

function DualEntryDefaultCompanyCardVendorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const defaultCompanyCardVendorID = dualentryConfig?.export?.defaultVendorID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT.getRoute(policyID) : undefined;

    const data: VendorListItem[] =
        dualentryData?.vendors
            ?.filter((vendorItem) => vendorItem.isActive)
            .map((vendorItem) => ({
                value: vendorItem.id,
                text: vendorItem.name,
                keyForList: vendorItem.id,
                isSelected: defaultCompanyCardVendorID === vendorItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.defaultCompanyCardVendor.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.dualEntry.noVendorsFound')}
            subtitle={translate('workspace.dualEntry.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectDefaultVendor = (item: VendorListItem) => {
        if (item.value !== defaultCompanyCardVendorID && policyID) {
            updateDualEntryDefaultVendor(policyID, item.value, defaultCompanyCardVendorID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DualEntryDefaultCompanyCardVendorPage"
            title="workspace.dualEntry.defaultCompanyCardVendor.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectDefaultVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={defaultCompanyCardVendorID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID)}
        />
    );
}

export default withPolicyConnections(DualEntryDefaultCompanyCardVendorPage);
