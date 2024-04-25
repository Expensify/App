import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function QuickbooksCompanyCardExpenseAccountPayableSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountsPayable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {exportAccountPayable} = policy?.connections?.quickbooksOnline?.config ?? {};

    const policyID = policy?.id ?? '';
    const data: CardListItem[] = useMemo(
        () =>
            accountsPayable?.map((account) => ({
                value: account.name,
                text: account.name,
                keyForList: account.name,
                isSelected: account.name === exportAccountPayable,
            })) ?? [],
        [exportAccountPayable, accountsPayable],
    );

    const selectAccountPayable = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportAccountPayable) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_ACCOUNT_PAYABLE, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [exportAccountPayable, policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountPayableSelectPage.displayName}>
                    <HeaderWithBackButton title={translate('workspace.qbo.accountsPayable')} />
                    <SelectionList
                        headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.accountsPayableDescription')}</Text>}
                        sections={[{data}]}
                        ListItem={RadioListItem}
                        onSelectRow={selectAccountPayable}
                        initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                    />
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountPayableSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountPayableSelectPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountPayableSelectPage);
