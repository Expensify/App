import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {setTravelInvoicingSettlementAccount} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';

type BankAccountListItem = ListItem & {value: number | undefined};

type WorkspaceTravelSettlementAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT>;

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

function WorkspaceTravelSettlementAccountPage({route}: WorkspaceTravelSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`, {canBeMissing: true});

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountsList);

    const eligibleBankAccountsOptions: BankAccountListItem[] = eligibleBankAccounts?.map((bankAccount) => {
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

    const listOptions: BankAccountListItem[] = eligibleBankAccountsOptions.length > 0 ? eligibleBankAccountsOptions : [];

    const handleSelectAccount = (value: number) => {
        const previousPaymentBankAccountID = cardSettings?.previousPaymentBankAccountID ?? cardSettings?.paymentBankAccountID;
        setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, value, previousPaymentBankAccountID);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceTravelSettlementAccountPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                    <View style={styles.flex1}>
                        <Text style={[styles.mh5, styles.mv3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                        {listOptions.length > 0 ? (
                            <SelectionList
                                data={listOptions}
                                ListItem={RadioListItem}
                                onSelectRow={({value}) => handleSelectAccount(value ?? 0)}
                                shouldSingleExecuteRowSelect
                                initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                                listFooterContent={
                                    <MenuItem
                                        icon={icons.Plus}
                                        title={translate('workspace.expensifyCard.addNewBankAccount')}
                                        onPress={() =>
                                            Navigation.navigate(
                                                ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(
                                                    policyID,
                                                    REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                                                    ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID),
                                                ),
                                            )
                                        }
                                    />
                                }
                            />
                        ) : (
                            <MenuItem
                                icon={icons.Plus}
                                title={translate('workspace.expensifyCard.addNewBankAccount')}
                                onPress={() =>
                                    Navigation.navigate(
                                        ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(
                                            policyID,
                                            REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                                            ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID),
                                        ),
                                    )
                                }
                            />
                        )}
                    </View>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTravelSettlementAccountPage.displayName = 'WorkspaceTravelSettlementAccountPage';

export default WorkspaceTravelSettlementAccountPage;
