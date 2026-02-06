import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSettlementAccount} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReconciliationAccountSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS>;

type ReconciliationAccountSettingsPageRouteParams = {
    backTo?: Route;
};

function ReconciliationAccountSettingsPage({route}: ReconciliationAccountSettingsPageProps) {
    const {policyID, connection} = route.params;
    const {backTo} = route.params as ReconciliationAccountSettingsPageRouteParams;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const connectionName = getConnectionNameFromRouteParam(connection);
    const defaultFundID = useDefaultFundID(policyID);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const paymentBankAccountID = cardSettings?.paymentBankAccountID;

    const selectedBankAccount = useMemo(() => bankAccountList?.[paymentBankAccountID?.toString() ?? ''], [paymentBankAccountID, bankAccountList]);
    const bankAccountNumber = useMemo(() => selectedBankAccount?.accountData?.accountNumber ?? '', [selectedBankAccount?.accountData?.accountNumber]);
    const settlementAccountEnding = getLastFourDigits(bankAccountNumber);
    const domainName = cardSettings?.domainName ?? getDomainNameForPolicy(policyID);
    const {environmentURL} = useEnvironment();

    const options = useMemo(() => {
        if (!bankAccountList || isEmptyObject(bankAccountList)) {
            return [];
        }
        const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);

        return eligibleBankAccounts.map((bankAccount, index) => ({
            text: bankAccount.title,
            value: bankAccount.accountData?.bankAccountID,
            keyForList: bankAccount.accountData?.bankAccountID?.toString() ?? `${bankAccount.title}-${index}`,
            isSelected: bankAccount.accountData?.bankAccountID === paymentBankAccountID,
            alternateText:
                bankAccount.description ??
                (bankAccount.accountData?.accountNumber ? `${translate('bankAccount.accountEnding')} ${getLastFourDigits(bankAccount.accountData.accountNumber)}` : ''),
        }));
    }, [bankAccountList, paymentBankAccountID, translate]);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection));
    }, [policyID, backTo, connection]);

    const selectBankAccount = (newBankAccountID?: number) => {
        updateSettlementAccount(domainName, defaultFundID, policyID, newBankAccountID, paymentBankAccountID);
        goBack();
    };

    return (
        <ConnectionLayout
            displayName="ReconciliationAccountSettingsPage"
            headerTitle="workspace.accounting.reconciliationAccount"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1, styles.pb2]}
            connectionName={connectionName}
            shouldUseScrollView={false}
            onBackButtonPress={goBack}
        >
            <Text style={[styles.textNormal, styles.mb5, styles.ph5]}>{translate('workspace.accounting.chooseReconciliationAccount.chooseBankAccount')}</Text>
            <View style={[styles.textNormal, styles.mb6, styles.ph5, styles.renderHTML, styles.flexRow]}>
                <RenderHTML
                    html={translate('workspace.accounting.chooseReconciliationAccount.settlementAccountReconciliation', {
                        settlementAccountUrl: `${environmentURL}/${ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute())}`,
                        lastFourPAN: settlementAccountEnding,
                    })}
                />
            </View>

            <SelectionList
                data={options}
                onSelectRow={({value}) => selectBankAccount(value)}
                ListItem={RadioListItem}
                initiallyFocusedItemKey={paymentBankAccountID?.toString()}
            />
        </ConnectionLayout>
    );
}

export default ReconciliationAccountSettingsPage;
