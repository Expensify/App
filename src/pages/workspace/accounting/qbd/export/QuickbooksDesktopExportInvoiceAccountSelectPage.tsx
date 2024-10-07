import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
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
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksDesktopExportInvoiceAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountsReceivable} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {canUseNewDotQBD} = usePermissions();

    const policyID = policy?.id ?? '-1';
    const data: CardListItem[] = useMemo(
        () =>
            accountsReceivable?.map((account) => ({
                value: account,
                text: account.name,
                keyForList: account.name,
                isSelected: account.id === qbdConfig?.receivableAccount?.id,
            })) ?? [],
        [qbdConfig?.receivableAccount, accountsReceivable],
    );

    const selectExportInvoice = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qbdConfig?.receivableAccount?.id) {
                QuickbooksDesktop.updateQuickbooksDesktopReceivableAccount(policyID, row.value, qbdConfig?.receivableAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_INVOICE_ACCOUNT_SELECT.getRoute(policyID));
        },
        [qbdConfig?.receivableAccount, policyID],
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
            displayName={QuickbooksDesktopExportInvoiceAccountSelectPage.displayName}
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbd.exportInvoicesDescription')}</Text>}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID))}
            onSelectRow={selectExportInvoice}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.qbd.exportInvoices"
            shouldBeBlocked={!canUseNewDotQBD} // TODO: remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.RECEIVABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.RECEIVABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.RECEIVABLE_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksDesktopExportInvoiceAccountSelectPage.displayName = 'QuickbooksDesktopExportInvoiceAccountSelectPage';

export default withPolicyConnections(QuickbooksDesktopExportInvoiceAccountSelectPage);
