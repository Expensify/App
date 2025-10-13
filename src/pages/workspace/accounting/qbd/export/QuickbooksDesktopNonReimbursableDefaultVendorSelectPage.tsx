import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopNonReimbursableBillDefaultVendor} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksDesktopNonReimbursableDefaultVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope'] as const);
    const {vendors} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const nonReimbursableBillDefaultVendor = qbdConfig?.export?.nonReimbursableBillDefaultVendor;

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const sections = useMemo(() => {
        const data: CardListItem[] =
            vendors?.map((vendor) => ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.name,
                // We use the logical OR (||) here instead of ?? because `nonReimbursableBillDefaultVendor` can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: vendor.id === (nonReimbursableBillDefaultVendor || vendors.at(0)?.id),
            })) ?? [];
        return data.length ? [{data}] : [];
    }, [nonReimbursableBillDefaultVendor, vendors]);

    const selectVendor = useCallback(
        (row: CardListItem) => {
            if (row.value !== nonReimbursableBillDefaultVendor) {
                updateQuickbooksDesktopNonReimbursableBillDefaultVendor(policyID, row.value, nonReimbursableBillDefaultVendor);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableBillDefaultVendor, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbd.noAccountsFound')}
                subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName}
            title="workspace.accounting.defaultVendor"
            sections={sections}
            listItem={RadioListItem}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={sections.at(0)?.data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
        />
    );
}

QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName = 'QuickbooksDesktopNonReimbursableDefaultVendorSelectPage';

export default withPolicyConnections(QuickbooksDesktopNonReimbursableDefaultVendorSelectPage);
