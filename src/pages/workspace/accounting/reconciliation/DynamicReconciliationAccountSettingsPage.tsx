import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getCardProgramKey, getCardSettings, getEligibleBankAccountsForCard} from '@libs/CardUtils';
import Log from '@libs/Log';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {updateSettlementAccount} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type DynamicReconciliationAccountSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_ACCOUNT_SETTINGS>;

function DynamicReconciliationAccountSettingsPage({route}: DynamicReconciliationAccountSettingsPageProps) {
    const {policyID, connection} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path);

    const connectionName = getConnectionNameFromRouteParam(connection);
    const defaultFundID = useDefaultFundID(policyID);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const programKey = getCardProgramKey(cardSettings);
    const settings = getCardSettings(cardSettings, programKey);
    const paymentBankAccountID = settings?.paymentBankAccountID;

    const selectedBankAccount = useMemo(() => bankAccountList?.[paymentBankAccountID?.toString() ?? ''], [paymentBankAccountID, bankAccountList]);
    const bankAccountNumber = useMemo(() => selectedBankAccount?.accountData?.accountNumber ?? '', [selectedBankAccount?.accountData?.accountNumber]);
    const settlementAccountEnding = getLastFourDigits(bankAccountNumber);
    const domainName = settings?.domainName ?? getDomainNameForPolicy(policyID);
    const {environmentURL} = useEnvironment();

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

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

    const selectBankAccount = (newBankAccountID?: number) => {
        if (!programKey) {
            Log.alert('[ReconciliationAccountSettingsPage] selectBankAccount called without a detected card program key');
            return;
        }
        updateSettlementAccount(domainName, defaultFundID, policyID, programKey, newBankAccountID, paymentBankAccountID);
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
                    html={translate(
                        'workspace.accounting.chooseReconciliationAccount.settlementAccountReconciliation',
                        `${environmentURL}/${ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute())}`,
                        settlementAccountEnding,
                    )}
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

export default DynamicReconciliationAccountSettingsPage;
