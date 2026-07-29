import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksCompanyCardExpenseAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {QBDNonReimbursableExportAccountType} from '@src/types/onyx/Policy';

import React, {useCallback, useMemo} from 'react';

type MenuItem = ListItem & {
    value: QBDNonReimbursableExportAccountType;
};

function DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;
    const nonReimbursableBillDefaultVendor = qbdConfig?.export?.nonReimbursableBillDefaultVendor;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_CARD_SELECT.path);

    const data: MenuItem[] = useMemo(
        () => [
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === nonReimbursable,
            },
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK === nonReimbursable,
            },
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === nonReimbursable,
            },
        ],
        [translate, nonReimbursable],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backPath, {compareParams: false});
    }, [backPath]);

    const selectExportCompanyCard = useCallback(
        (row: MenuItem) => {
            if (row.value !== nonReimbursable && policyID) {
                // Switching export type invalidates the previously selected account/vendor because the list of available accounts differs per export type. Clear them so the admin is required to choose on the next screens.
                updateQuickbooksCompanyCardExpenseAccount(
                    policyID,
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE]: row.value,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT]: '',
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE as string,
                    },
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE]: nonReimbursable,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT]: nonReimbursableAccount,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableBillDefaultVendor,
                    },
                );
            }
            goBack();
        },
        [nonReimbursable, nonReimbursableAccount, nonReimbursableBillDefaultVendor, policyID, goBack],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectCardPage"
            title="workspace.accounting.exportAs"
            data={data}
            onSelectRow={(selection: SelectorType) => selectExportCompanyCard(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={goBack}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE], qbdConfig?.pendingFields)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE)}
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectCardPage);
