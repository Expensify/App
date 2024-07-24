import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ReconciliationAccountSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS>;

function ReconciliationAccountSettingsPage({route}: ReconciliationAccountSettingsPageProps) {
    const {policyID, connection} = route.params;
    const settlementAccountEnding = '1234'; // TODO: use correct settlement account ending value https://github.com/Expensify/App/issues/44313

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);
    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? '';

    const selectedBankAccount = useMemo(() => bankAccountList?.[paymentBankAccountID], [paymentBankAccountID, bankAccountList]);

    const sections = useMemo(() => {
        const data = Object.values(bankAccountList ?? {}).map((bankAccount) => ({
            text: bankAccount.title,
            value: bankAccount.accountData?.bankAccountID,
            keyForList: bankAccount.accountData?.bankAccountID?.toString(),
            isSelected: bankAccount.accountData?.bankAccountID === selectedBankAccount?.accountData?.bankAccountID,
        }));
        return [{data}];
    }, [bankAccountList, selectedBankAccount]);

    const selectBankAccount = () => {
        // TODO: add API call when it's implemented https://github.com/Expensify/Expensify/issues/407836
        // Navigation.goBack();
    };

    return (
        <ConnectionLayout
            displayName={ReconciliationAccountSettingsPage.displayName}
            headerTitle="workspace.accounting.reconciliationAccount"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1, styles.pb2]}
            connectionName={connection}
            shouldUseScrollView={false}
        >
            <Text style={[styles.textNormal, styles.mb5, styles.ph5]}>{translate('workspace.accounting.chooseReconciliationAccount.chooseBankAccount')}</Text>
            <Text style={[styles.textNormal, styles.mb6, styles.ph5]}>
                {translate('workspace.accounting.chooseReconciliationAccount.accountMatches')}
                <TextLink
                    onPress={() => {
                        // TODO: navigate to Settlement Account https://github.com/Expensify/App/issues/44313
                    }}
                >
                    {translate('workspace.accounting.chooseReconciliationAccount.settlementAccount')}
                </TextLink>
                {translate('workspace.accounting.chooseReconciliationAccount.reconciliationWorks', settlementAccountEnding)}
            </Text>

            <SelectionList
                sections={sections}
                onSelectRow={selectBankAccount}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={selectedBankAccount?.accountData?.bankAccountID?.toString()}
            />
        </ConnectionLayout>
    );
}

ReconciliationAccountSettingsPage.displayName = 'ReconciliationAccountSettingsPage';

export default ReconciliationAccountSettingsPage;
