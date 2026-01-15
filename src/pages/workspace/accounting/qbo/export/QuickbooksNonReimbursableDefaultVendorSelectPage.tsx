import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineNonReimbursableBillDefaultVendor} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksNonReimbursableDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const data: CardListItem[] = useMemo(
        () =>
            vendors?.map((vendor) => ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.name,
                isSelected: vendor.id === qboConfig?.nonReimbursableBillDefaultVendor,
            })) ?? [],
        [qboConfig?.nonReimbursableBillDefaultVendor, vendors],
    );

    const selectVendor = useCallback(
        (row: CardListItem) => {
            if (row.value !== qboConfig?.nonReimbursableBillDefaultVendor) {
                updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID, row.value, qboConfig?.nonReimbursableBillDefaultVendor);
            }
            Navigation.goBack();
        },
        [qboConfig?.nonReimbursableBillDefaultVendor, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksNonReimbursableDefaultVendorSelectPage"
            title="workspace.accounting.defaultVendor"
            data={data}
            listItem={RadioListItem}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack()}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
        />
    );
}

export default withPolicyConnections(QuickbooksNonReimbursableDefaultVendorSelectPage);
