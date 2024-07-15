import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
// import * as CardUtils from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';

function WorkspaceSettlementAccountPage({route}: StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID ?? '-1';
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? '';

    // TODO: for now not filtering the accounts for easier testing
    // const eligibleBankAccounts = CardUtils.getEligibleBankAccountsForCard(bankAccountsList ?? {});
    const eligibleBankAccounts = Object.values(bankAccountsList ?? {});

    const data = useMemo(() => {
        const options = eligibleBankAccounts.map((bankAccount) => {
            const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

            return {
                value: bankAccount.accountData?.bankAccountID,
                text: bankAccount.title,
                icon,
                iconSize,
                iconStyles,
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${bankAccountNumber.slice(-4)}`,
                keyForList: bankAccount.accountData?.bankAccountID?.toString(),
                isSelected: bankAccount.accountData?.bankAccountID === paymentBankAccountID,
            };
        });
        return options;
    }, [eligibleBankAccounts, paymentBankAccountID, styles, translate]);

    const updateSettlementAccount = (value: number) => {
        Card.updateSettlementAccount(policyID, value);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            // featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceSettlementAccountPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.expensifyCard.settlementAccount')} />
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => updateSettlementAccount(value ?? 0)}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={paymentBankAccountID.toString()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceSettlementAccountPage.displayName = 'WorkspaceSettlementAccountPage';

export default WorkspaceSettlementAccountPage;
