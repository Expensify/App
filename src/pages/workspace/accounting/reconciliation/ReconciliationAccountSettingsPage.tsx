import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as AccountingUtils from '@libs/AccountingUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as CardUtils from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReconciliationAccountSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS>;

function ReconciliationAccountSettingsPage({route}: ReconciliationAccountSettingsPageProps) {
    const {policyID, connection} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const connectionName = AccountingUtils.getConnectionNameFromRouteParam(connection);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? 0;

    const selectedBankAccount = useMemo(() => bankAccountList?.[paymentBankAccountID.toString()], [paymentBankAccountID, bankAccountList]);
    const bankAccountNumber = useMemo(() => selectedBankAccount?.accountData?.accountNumber ?? '', [selectedBankAccount]);
    const settlementAccountEnding = getLastFourDigits(bankAccountNumber);

    const sections = useMemo(() => {
        if (!bankAccountList || isEmptyObject(bankAccountList)) {
            return [];
        }
        const eligibleBankAccounts = CardUtils.getEligibleBankAccountsForCard(bankAccountList);

        const data = eligibleBankAccounts.map((bankAccount) => ({
            text: bankAccount.title,
            value: bankAccount.accountData?.bankAccountID,
            keyForList: bankAccount.accountData?.bankAccountID?.toString(),
            isSelected: bankAccount.accountData?.bankAccountID === paymentBankAccountID,
        }));
        return [{data}];
    }, [bankAccountList, paymentBankAccountID]);

    const selectBankAccount = (newBankAccountID?: number) => {
        Card.updateSettlementAccount(workspaceAccountID, policyID, newBankAccountID, paymentBankAccountID);
        Navigation.goBack();
    };

    return (
        <ConnectionLayout
            displayName={ReconciliationAccountSettingsPage.displayName}
            headerTitle="workspace.accounting.reconciliationAccount"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1, styles.pb2]}
            connectionName={connectionName}
            shouldUseScrollView={false}
        >
            <Text style={[styles.textNormal, styles.mb5, styles.ph5]}>{translate('workspace.accounting.chooseReconciliationAccount.chooseBankAccount')}</Text>
            <Text style={[styles.textNormal, styles.mb6, styles.ph5]}>
                {translate('workspace.accounting.chooseReconciliationAccount.accountMatches')}
                <TextLink onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID))}>
                    {translate('workspace.accounting.chooseReconciliationAccount.settlementAccount')}
                </TextLink>
                {translate('workspace.accounting.chooseReconciliationAccount.reconciliationWorks', settlementAccountEnding)}
            </Text>

            <SelectionList
                sections={sections}
                onSelectRow={({value}) => selectBankAccount(value)}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={paymentBankAccountID.toString()}
            />
        </ConnectionLayout>
    );
}

ReconciliationAccountSettingsPage.displayName = 'ReconciliationAccountSettingsPage';

export default ReconciliationAccountSettingsPage;
