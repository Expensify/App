import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
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
    const {vendors} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const nonReimbursableBillDefaultVendor = qbdConfig?.export?.nonReimbursableBillDefaultVendor;
    const {canUseNewDotQBD} = usePermissions();

    const policyID = policy?.id ?? '-1';
    const sections = useMemo(() => {
        const data: CardListItem[] =
            vendors?.map((vendor) => ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.name,
                isSelected: vendor.id === nonReimbursableBillDefaultVendor,
            })) ?? [];
        return data.length ? [{data}] : [];
    }, [nonReimbursableBillDefaultVendor, vendors]);

    const selectVendor = useCallback(
        (row: CardListItem) => {
            if (row.value !== nonReimbursableBillDefaultVendor) {
                QuickbooksDesktop.updateQuickbooksDesktopNonReimbursableBillDefaultVendor(policyID, row.value, nonReimbursableBillDefaultVendor);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableBillDefaultVendor, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbd.noAccountsFound')}
                subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName}
            title="workspace.accounting.defaultVendor"
            sections={sections}
            listItem={RadioListItem}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={sections.at(0)?.data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID))}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)}
        />
    );
}

QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName = 'QuickbooksDesktopNonReimbursableDefaultVendorSelectPage';

export default withPolicyConnections(QuickbooksDesktopNonReimbursableDefaultVendorSelectPage);
