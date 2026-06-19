import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getCardProgramKey, getCardSettings, getConnectionBankAccountsForReconciliation} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import {getTravelSettlementAccount} from '@libs/TravelInvoicingUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {setCardReconciliationAccount} from '@userActions/Card';
import {setTravelInvoicingReconciliationBankAccount} from '@userActions/TravelInvoicing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankAccountList, Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import RECONCILIATION_ACCOUNT_SETTINGS_TYPE from './constants';

type DynamicReconciliationAccountSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_ACCOUNT_SETTINGS>;
type ReconciliationAccountSettingsLayoutProps = {
    policyID: string;
    connectionName: ConnectionName;
    connectionBankAccounts: ReturnType<typeof getConnectionBankAccountsForReconciliation>;
    goBack: () => void;
    description: string;
    html: string;
    selectedBankAccountID?: string;
    onSelectBankAccount: (newBankAccountID?: string) => void;
};

type DynamicReconciliationProps = {
    policyID: string;
    workspaceAccountID: number;
    domainName: string;
    bankAccountList: OnyxEntry<BankAccountList>;
    goBack: () => void;
    connectionName: ConnectionName;
    connectionBankAccounts: ReturnType<typeof getConnectionBankAccountsForReconciliation>;
};

const policyConnectionsSelector = (policy: OnyxEntry<Policy>) => policy?.connections;
const policyWorkspaceAccountIDSelector = (policy: OnyxEntry<Policy>) => policy?.policyAccountID;

function ReconciliationAccountSettingsLayout({
    policyID,
    connectionName,
    connectionBankAccounts,
    goBack,
    description,
    html,
    selectedBankAccountID,
    onSelectBankAccount,
}: ReconciliationAccountSettingsLayoutProps) {
    const styles = useThemeStyles();

    const options = connectionBankAccounts.map((bankAccount) => ({
        text: bankAccount.name,
        value: bankAccount.id,
        keyForList: bankAccount.id,
        isSelected: bankAccount.id === selectedBankAccountID,
    }));

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
            <Text style={[styles.textNormal, styles.mb5, styles.ph5]}>{description}</Text>
            <View style={[styles.textNormal, styles.mb6, styles.ph5, styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={html} />
            </View>

            <SelectionList
                data={options}
                onSelectRow={({value}) => onSelectBankAccount(value)}
                ListItem={SingleSelectListItem}
                initiallyFocusedItemKey={selectedBankAccountID}
            />
        </ConnectionLayout>
    );
}

function ExpensifyCardDynamicReconciliation({policyID, workspaceAccountID, domainName, bankAccountList, goBack, connectionName, connectionBankAccounts}: DynamicReconciliationProps) {
    const {translate} = useLocalize();
    const defaultFundID = useDefaultFundID(policyID);

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const programKey = getCardProgramKey(cardSettings);
    const settings = getCardSettings(cardSettings, programKey);
    const paymentBankAccountID = settings?.paymentBankAccountID;
    const [reconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`);

    const selectedBankAccount = bankAccountList?.[paymentBankAccountID?.toString() ?? ''];
    const bankAccountNumber = selectedBankAccount?.accountData?.accountNumber ?? '';
    const settlementAccountEnding = getLastFourDigits(bankAccountNumber);
    const reconciliationDomainName = settings?.domainName ?? domainName;
    const {environmentURL} = useEnvironment();

    const selectBankAccount = (newBankAccountID?: string) => {
        if (!newBankAccountID) {
            return;
        }
        setCardReconciliationAccount(workspaceAccountID, reconciliationDomainName, newBankAccountID, reconciliationBankAccountID);
        goBack();
    };

    return (
        <ReconciliationAccountSettingsLayout
            policyID={policyID}
            connectionName={connectionName}
            connectionBankAccounts={connectionBankAccounts}
            goBack={goBack}
            description={translate('workspace.accounting.chooseReconciliationAccount.chooseBankAccount')}
            html={translate(
                'workspace.accounting.chooseReconciliationAccount.settlementAccountReconciliation',
                `${environmentURL}${createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.path)}`,
                settlementAccountEnding,
            )}
            selectedBankAccountID={reconciliationBankAccountID}
            onSelectBankAccount={selectBankAccount}
        />
    );
}

function TravelInvoicingDynamicReconciliation({policyID, workspaceAccountID, domainName, bankAccountList, goBack, connectionName, connectionBankAccounts}: DynamicReconciliationProps) {
    const {translate} = useLocalize();

    const [travelInvoicingCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [travelInvoicingReconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`);
    const travelInvoicingSettings = getCardSettings(travelInvoicingCardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const travelInvoicingSettlementAccount = getTravelSettlementAccount(travelInvoicingSettings, bankAccountList);
    const settlementAccountEnding = travelInvoicingSettlementAccount?.last4 ?? '';

    const selectBankAccount = (newBankAccountID?: string) => {
        if (!newBankAccountID) {
            return;
        }
        setTravelInvoicingReconciliationBankAccount(workspaceAccountID, domainName, newBankAccountID, travelInvoicingReconciliationBankAccountID);
        goBack();
    };

    return (
        <ReconciliationAccountSettingsLayout
            policyID={policyID}
            connectionName={connectionName}
            connectionBankAccounts={connectionBankAccounts}
            goBack={goBack}
            description={translate('workspace.accounting.chooseReconciliationAccount.chooseTravelInvoicingBankAccount')}
            html={translate('workspace.accounting.chooseReconciliationAccount.travelInvoicingSettlementAccountReconciliation', settlementAccountEnding)}
            selectedBankAccountID={travelInvoicingReconciliationBankAccountID}
            onSelectBankAccount={selectBankAccount}
        />
    );
}

function DynamicReconciliationAccountSettingsPage({route}: DynamicReconciliationAccountSettingsPageProps) {
    const {policyID, connection, reconciliationAccountSettingsType} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path);

    const connectionName = getConnectionNameFromRouteParam(connection);
    const domainName = getDomainNameForPolicy(policyID);

    const [connections] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyConnectionsSelector});
    const [workspaceAccountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyWorkspaceAccountIDSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const connectionBankAccounts = getConnectionBankAccountsForReconciliation(connections, connectionName);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    if (reconciliationAccountSettingsType === RECONCILIATION_ACCOUNT_SETTINGS_TYPE.TRAVEL_INVOICING) {
        return (
            <TravelInvoicingDynamicReconciliation
                policyID={policyID}
                workspaceAccountID={workspaceAccountID}
                domainName={domainName}
                bankAccountList={bankAccountList}
                goBack={goBack}
                connectionName={connectionName}
                connectionBankAccounts={connectionBankAccounts}
            />
        );
    }

    return (
        <ExpensifyCardDynamicReconciliation
            policyID={policyID}
            workspaceAccountID={workspaceAccountID}
            domainName={domainName}
            bankAccountList={bankAccountList}
            goBack={goBack}
            connectionName={connectionName}
            connectionBankAccounts={connectionBankAccounts}
        />
    );
}

export default DynamicReconciliationAccountSettingsPage;
