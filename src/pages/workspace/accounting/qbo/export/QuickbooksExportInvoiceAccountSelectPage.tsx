import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksExportInvoiceAccountSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountsReceivable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {exportInvoice} = policy?.connections?.quickbooksOnline?.config ?? {};
    // TODO - should be removed after API fully working
    const draft = [
        {
            name: translate(`workspace.qbo.receivable`),
        },
        {
            name: translate(`workspace.qbo.archive`),
        },
    ];
    const result = accountsReceivable?.length ? accountsReceivable : draft;

    const policyID = policy?.id ?? '';
    const data = useMemo(
        () =>
            result?.map((account) => ({
                value: account.name,
                text: account.name,
                keyForList: account.name,
                isSelected: account.name === exportInvoice,
            })),
        [exportInvoice, result],
    );

    const onSelectRow = useCallback(
        (row: {value: string}) => {
            if (exportInvoice && row.value === exportInvoice) {
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID));
                return;
            }
            Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.EXPORT_INVOICE, row.value);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID));
        },
        [exportInvoice, policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksExportInvoiceAccountSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportInvoices')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportInvoicesDescription')}</Text>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksExportInvoiceAccountSelectPage.displayName = 'QuickbooksExportInvoiceAccountSelectPage';

export default withPolicy(QuickbooksExportInvoiceAccountSelectPage);
