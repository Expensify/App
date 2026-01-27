import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import MenuItem from '@components/MenuItem';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {setTravelInvoicingSettlementAccount} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard, getEligibleBankAccountsForUkEuCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updateSettlementAccount as updateSettlementAccountCard} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';
import type {ConnectionName} from '@src/types/onyx/Policy';

type BankAccountListItem = ListItem & {value: number | undefined};

type WorkspaceSettlementAccountPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT | typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT
> & {
    /** Whether this component is being used for Travel Invoicing */
    isTravelInvoicing?: boolean;
};

function BankAccountListItemLeftElement({bankName}: {bankName: BankName}) {
    const styles = useThemeStyles();
    const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
            <Icon
                src={icon}
                width={iconSize}
                height={iconSize}
                additionalStyles={iconStyles}
            />
        </View>
    );
}

function WorkspaceSettlementAccountPage({route, isTravelInvoicing = false}: WorkspaceSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    // Use separate hooks for each card settings key type to avoid conditional hook issues
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const [travelCardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID), {canBeMissing: true});

    // Select the appropriate card settings based on the mode
    const cardSettings = isTravelInvoicing ? travelCardSettings : expensifyCardSettings;

    // These are only used for Expensify Card (not travel invoicing)
    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${defaultFundID}`, {canBeMissing: true});
    const [reconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${defaultFundID}`, {canBeMissing: true});
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const paymentBankAccountNumberFromCardSettings = cardSettings?.paymentBankAccountNumber;
    const paymentBankAccountAddressName = cardSettings?.paymentBankAccountAddressName;
    const paymentBankAccountNumber = bankAccountsList?.[paymentBankAccountID?.toString() ?? '']?.accountData?.accountNumber ?? paymentBankAccountNumberFromCardSettings ?? '';

    // For Travel Invoicing, always use the standard eligible accounts; for Expensify Card, check UK/EU support
    const getEligibleBankAccounts = () => {
        if (isTravelInvoicing) {
            return getEligibleBankAccountsForCard(bankAccountsList);
        }
        if (isUkEuCurrencySupported) {
            return getEligibleBankAccountsForUkEuCard(bankAccountsList, policy?.outputCurrency);
        }
        return getEligibleBankAccountsForCard(bankAccountsList);
    };
    const eligibleBankAccounts = getEligibleBankAccounts();

    const domainName = cardSettings?.domainName ?? getDomainNameForPolicy(policyID);

    const hasActiveAccountingConnection = !!(policy?.connections && Object.keys(policy.connections).length > 0);

    const fetchPolicyAccountingData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openPolicyAccountingPage(policyID);
    }, [policyID]);

    useEffect(() => {
        // Only fetch accounting data for Expensify Card flow
        if (isTravelInvoicing || !cardSettings || !hasActiveAccountingConnection || continuousReconciliation?.value !== undefined || reconciliationConnection !== undefined) {
            return;
        }
        fetchPolicyAccountingData();
    }, [cardSettings, hasActiveAccountingConnection, continuousReconciliation?.value, reconciliationConnection, fetchPolicyAccountingData, isTravelInvoicing]);

    const eligibleBankAccountsOptions: BankAccountListItem[] = eligibleBankAccounts.map((bankAccount) => {
        const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
        const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
        const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;

        return {
            value: bankAccountID,
            text: bankAccount.title,
            leftElement: <BankAccountListItemLeftElement bankName={bankName} />,
            alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
            keyForList: bankAccountID?.toString() ?? '',
            isSelected: bankAccountID === paymentBankAccountID,
        };
    });

    const fallbackBankAccountOption: BankAccountListItem = {
        value: paymentBankAccountID,
        text: paymentBankAccountAddressName ?? '',
        leftElement: <BankAccountListItemLeftElement bankName={(paymentBankAccountAddressName ?? '') as BankName} />,
        alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(paymentBankAccountNumberFromCardSettings ?? '')}`,
        keyForList: paymentBankAccountID?.toString() ?? '',
        isSelected: true,
    };

    // For Travel Invoicing, don't show fallback if no eligible accounts
    const getListOptions = (): BankAccountListItem[] => {
        if (eligibleBankAccountsOptions.length > 0) {
            return eligibleBankAccountsOptions;
        }
        if (isTravelInvoicing) {
            return [];
        }
        return [fallbackBankAccountOption];
    };
    const listOptions = getListOptions();

    const handleSelectAccount = (value: number) => {
        if (isTravelInvoicing) {
            const previousPaymentBankAccountID = cardSettings?.previousPaymentBankAccountID ?? cardSettings?.paymentBankAccountID;
            setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, value, previousPaymentBankAccountID);
        } else {
            updateSettlementAccountCard(domainName, defaultFundID, policyID, value, paymentBankAccountID);
        }
        Navigation.goBack();
    };

    const handleAddNewBankAccount = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID)));
    };

    const getCustomListHeaderContent = () => {
        // For Travel Invoicing, use a simpler header
        if (isTravelInvoicing) {
            return <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>;
        }

        const connectionName = reconciliationConnection ?? '';
        const connectionParam = getRouteParamForConnection(connectionName as ConnectionName);

        return (
            <>
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
                {!!continuousReconciliation?.value && !!connectionParam && hasActiveAccountingConnection && (
                    <View style={[styles.renderHTML, styles.mh5, styles.mb6]}>
                        <RenderHTML
                            html={translate('workspace.expensifyCard.settlementAccountInfo', {
                                reconciliationAccountSettingsLink: `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connectionParam, Navigation.getActiveRoute())}`,
                                accountNumber: `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(paymentBankAccountNumber)}`,
                            })}
                        />
                    </View>
                )}
            </>
        );
    };
    const customListHeaderContent = getCustomListHeaderContent();

    const featureName = isTravelInvoicing ? CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED : CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED;

    // Render "Add new bank account" as list footer for Travel Invoicing
    const listFooterContent = isTravelInvoicing ? (
        <MenuItem
            icon={icons.Plus}
            title={translate('workspace.expensifyCard.addNewBankAccount')}
            onPress={handleAddNewBankAccount}
        />
    ) : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
        >
            <ScreenWrapper
                testID="WorkspaceSettlementAccountPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => {
                        if (isTravelInvoicing) {
                            Navigation.goBack();
                            return;
                        }
                        if (route.params && 'backTo' in route.params && route.params.backTo) {
                            Navigation.goBack(route.params.backTo);
                            return;
                        }
                        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID));
                    }}
                />
                {isTravelInvoicing ? (
                    <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                        <View style={styles.flex1}>
                            <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                            {listOptions.length > 0 ? (
                                <SelectionList
                                    data={listOptions}
                                    ListItem={RadioListItem}
                                    onSelectRow={({value}) => handleSelectAccount(value ?? 0)}
                                    shouldSingleExecuteRowSelect
                                    initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                                    listFooterContent={listFooterContent}
                                />
                            ) : (
                                <MenuItem
                                    icon={icons.Plus}
                                    title={translate('workspace.expensifyCard.addNewBankAccount')}
                                    onPress={handleAddNewBankAccount}
                                />
                            )}
                        </View>
                    </FullPageOfflineBlockingView>
                ) : (
                    <SelectionList
                        addBottomSafeAreaPadding
                        data={listOptions}
                        ListItem={RadioListItem}
                        onSelectRow={({value}) => handleSelectAccount(value ?? 0)}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                        customListHeaderContent={customListHeaderContent}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettlementAccountPage;
