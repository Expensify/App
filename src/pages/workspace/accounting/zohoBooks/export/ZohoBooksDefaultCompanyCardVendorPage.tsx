/**
 * Lets an admin pick the default Zoho Books vendor for company card expenses that don't match a vendor automatically.
 * Only active vendor records are listed, and the selection can be cleared with None.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearZohoBooksErrorField, updateZohoBooksDefaultVendor} from '@libs/actions/connections/ZohoBooks';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {withClearRow} from '@libs/ListUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getZohoBooksVendors, settingsPendingAction, sortVendors} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ZohoBooksVendor} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type VendorListItem = ListItem & {
    value: ZohoBooksVendor['id'];
};

function ZohoBooksDefaultCompanyCardVendorPage({policy}: WithPolicyConnectionsProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const defaultCompanyCardVendorID = zohoBooksConfig?.export?.defaultVendorID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT.getRoute(policyID) : undefined;

    const sortedVendors = sortVendors(getZohoBooksVendors(policy), localeCompare);
    const vendorOptions: VendorListItem[] = sortedVendors.map((vendorItem) => ({
        value: vendorItem.id,
        text: vendorItem.name,
        keyForList: vendorItem.id,
        isSelected: defaultCompanyCardVendorID === vendorItem.id,
    }));
    const clearOption: VendorListItem = {
        value: '',
        text: translate('common.none'),
        keyForList: '',
        isSelected: !defaultCompanyCardVendorID,
    };
    const shouldShowClearOption = !!defaultCompanyCardVendorID || vendorOptions.length > 0;
    const {filteredData: filteredVendorOptions, textInputOptions, pinnedValues} = useSelectionListSearch(vendorOptions);
    // Place the clear row below the top vendor only when that vendor is the one the hook actually pinned.
    const firstVendorValue = filteredVendorOptions.at(0)?.value;
    const isSelectionPinnedToTop = firstVendorValue !== undefined && pinnedValues.includes(firstVendorValue);
    const data: VendorListItem[] = shouldShowClearOption ? withClearRow(filteredVendorOptions, clearOption, isSelectionPinnedToTop) : filteredVendorOptions;

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.defaultCompanyCardVendor.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.zohoBooks.noVendorsFound')}
            subtitle={translate('workspace.zohoBooks.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectDefaultVendor = (item: VendorListItem) => {
        if (item.value !== defaultCompanyCardVendorID && policyID) {
            updateZohoBooksDefaultVendor(policyID, item.value, defaultCompanyCardVendorID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="ZohoBooksDefaultCompanyCardVendorPage"
            title="workspace.zohoBooks.defaultCompanyCardVendor.label"
            data={data}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectDefaultVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={defaultCompanyCardVendorID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksDefaultCompanyCardVendorPage);
