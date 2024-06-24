import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksExportInvoiceAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountsReceivable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {receivableAccount} = policy?.connections?.quickbooksOnline?.config ?? {};

    const policyID = policy?.id ?? '-1';
    const data: CardListItem[] = useMemo(
        () =>
            accountsReceivable?.map((account) => ({
                value: account,
                text: account.name,
                keyForList: account.name,
                isSelected: account.id === receivableAccount?.id,
            })) ?? [],
        [receivableAccount, accountsReceivable],
    );

    const selectExportInvoice = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== receivableAccount?.id) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.RECEIVABLE_ACCOUNT, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID));
        },
        [receivableAccount, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.common.noAccountsFound')}
                subtitle={translate('workspace.common.noAccountsFoundDescription', CONST.POLICY.CONNECTIONS.NAME.QBO)}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksExportInvoiceAccountSelectPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.exportInvoices')} />
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportInvoicesDescription')}</Text>}
                    sections={data.length ? [{data}] : []}
                    ListItem={RadioListItem}
                    onSelectRow={selectExportInvoice}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                    listEmptyContent={listEmptyContent}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksExportInvoiceAccountSelectPage.displayName = 'QuickbooksExportInvoiceAccountSelectPage';

export default withPolicyConnections(QuickbooksExportInvoiceAccountSelectPage);
