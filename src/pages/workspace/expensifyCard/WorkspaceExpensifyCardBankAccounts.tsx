import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as CardUtils from '@libs/CardUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceExpensifyCardBankAccountsProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT>;

function WorkspaceExpensifyCardBankAccounts({route}: WorkspaceExpensifyCardBankAccountsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const policyID = route?.params?.policyID;

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const handleAddBankAccount = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('new', policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };

    const handleSelectBankAccount = (value?: number) => {
        Card.configureExpensifyCardsForPolicy(policyID, value);
        Card.updateSettlementAccount(workspaceAccountID, policyID, value);
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
    };

    const renderBankOptions = () => {
        if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
            return null;
        }

        const eligibleBankAccounts = CardUtils.getEligibleBankAccountsForCard(bankAccountsList);

        return eligibleBankAccounts.map((bankAccount) => {
            const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount?.methodID;

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

            return (
                <MenuItem
                    title={bankName}
                    description={`${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`}
                    onPress={() => handleSelectBankAccount(bankAccountID)}
                    icon={icon}
                    iconHeight={iconSize}
                    iconWidth={iconSize}
                    iconStyles={iconStyles}
                    shouldShowRightIcon
                    displayInDefaultIconColor
                />
            );
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceExpensifyCardBankAccounts.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <HeaderWithBackButton
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    title={translate('workspace.expensifyCard.chooseBankAccount')}
                />
                <View style={styles.flex1}>
                    <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                    {renderBankOptions()}
                    <MenuItem
                        icon={Expensicons.Plus}
                        title={translate('workspace.expensifyCard.addNewBankAccount')}
                        onPress={handleAddBankAccount}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardBankAccounts.displayName = 'WorkspaceExpensifyCardBankAccounts';

export default WorkspaceExpensifyCardBankAccounts;
