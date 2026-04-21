import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteTravelInvoicingPayableAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type PayableAccountListItem = ListItem & {
    value: string;
};

function NetSuiteTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const {payableList} = policy?.connections?.netsuite?.options?.data ?? {};
    const config = policy?.connections?.netsuite?.options?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const data: PayableAccountListItem[] =
        payableList?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.id,
            isSelected: account.id === config?.travelInvoicingPayableAccountID,
        })) ?? [];

    const selectAccount = (row: PayableAccountListItem) => {
        if (row.value !== config?.travelInvoicingPayableAccountID) {
            updateNetSuiteTravelInvoicingPayableAccount(policyID, row.value, config?.travelInvoicingPayableAccountID);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID));
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.netsuite.noAccountsFound')}
            subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteTravelInvoicingPayableAccountSelectPage"
            title="workspace.netsuite.travelInvoicingPayableAccount"
            data={data}
            listItem={RadioListItem}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((option) => option.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteTravelInvoicingPayableAccountSelectPage);
