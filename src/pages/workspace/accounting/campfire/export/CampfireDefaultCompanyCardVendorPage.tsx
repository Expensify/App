import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCampfireErrorField, updateCampfireDefaultVendor} from '@libs/actions/connections/Campfire';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CampfireVendor} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type VendorListItem = ListItem & {
    value: CampfireVendor['id'];
};

function CampfireDefaultCompanyCardVendorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const defaultCompanyCardVendorID = campfireConfig?.export?.defaultVendorID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT.getRoute(policyID) : undefined;

    const data: VendorListItem[] =
        campfireData?.vendors
            ?.filter((vendorItem) => vendorItem.isActive && vendorItem.vendorType === CONST.CAMPFIRE_VENDOR_TYPE.VENDOR)
            .map((vendorItem) => ({
                value: vendorItem.id,
                text: vendorItem.name,
                keyForList: vendorItem.id,
                isSelected: defaultCompanyCardVendorID === vendorItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.defaultCompanyCardVendor.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.campfire.noVendorsFound')}
            subtitle={translate('workspace.campfire.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectDefaultVendor = (item: VendorListItem) => {
        if (item.value !== defaultCompanyCardVendorID && policyID) {
            updateCampfireDefaultVendor(policyID, item.value, defaultCompanyCardVendorID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CampfireDefaultCompanyCardVendorPage"
            title="workspace.campfire.defaultCompanyCardVendor.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectDefaultVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={defaultCompanyCardVendorID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID], campfireConfig?.pendingFields)}
            errors={getLatestErrorField(campfireConfig, CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID)}
        />
    );
}

export default withPolicyConnections(CampfireDefaultCompanyCardVendorPage);
