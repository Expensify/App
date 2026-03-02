import {useRoute} from '@react-navigation/native';
import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearQBOErrorField} from '@libs/actions/Policy/Policy';
import {updateConnectionConfig} from '@libs/actions/PolicyConnections';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksExportTravelVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TRAVEL_INVOICING_VENDOR_SELECT>>();
    const params = route.params;
    const backTo = params.backTo;

    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const data: CardListItem[] =
        vendors?.map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.name,
            isSelected: vendor.id === qboConfig?.travelInvoicingVendorID,
        })) ?? [];

    const selectVendor = (row: CardListItem) => {
        if (row.value !== qboConfig?.travelInvoicingVendorID) {
            updateConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, {travelInvoicingVendorID: row.value}, {travelInvoicingVendorID: qboConfig?.travelInvoicingVendorID});
        }
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID));
    };

    const getListEmptyContent = () => (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.qbo.noAccountsFound')}
            subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listEmptyContent = getListEmptyContent();

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksExportTravelVendorSelectPage"
            title="workspace.qbo.travelInvoicingVendor"
            data={data}
            listItem={RadioListItem}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR)}
        />
    );
}

export default withPolicyConnections(QuickbooksExportTravelVendorSelectPage);
