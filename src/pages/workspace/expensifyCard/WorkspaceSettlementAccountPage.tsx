import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
// import * as CardUtils from '@libs/CardUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';

type WorkspaceSettlementAccountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT>;

function WorkspaceSettlementAccountPage({route}: WorkspaceSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID ?? '-1';
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);
    // TODO: uncomment after integration with the BE
    // const [isUsedContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${policyID}`);
    // const [reconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${policyID}`);

    // TODO: remove after integration with the BE
    const isUsedContinuousReconciliation = true;
    const reconciliationConnection = CONST.POLICY.CONNECTIONS.NAME.QBO;

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? '';
    const paymentBankAccountNumber = bankAccountsList?.[paymentBankAccountID]?.accountData?.accountNumber ?? '';

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
                leftElement: icon && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                    </View>
                ),
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
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
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceSettlementAccountPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                />
                <ScrollView>
                    <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
                    {isUsedContinuousReconciliation && (
                        <Text style={[styles.mh5, styles.mb6]}>
                            <Text>{translate('workspace.expensifyCard.settlementAccountInfoPt1')}</Text>{' '}
                            <TextLink onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, reconciliationConnection))}>
                                {translate('workspace.expensifyCard.reconciliationAccount')}
                            </TextLink>{' '}
                            <Text>{`(${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(paymentBankAccountNumber)}) `}</Text>
                            <Text>{translate('workspace.expensifyCard.settlementAccountInfoPt2')}</Text>
                        </Text>
                    )}
                    <SelectionList
                        sections={[{data}]}
                        ListItem={RadioListItem}
                        onSelectRow={({value}) => updateSettlementAccount(value ?? 0)}
                        shouldDebounceRowSelect
                        initiallyFocusedOptionKey={paymentBankAccountID.toString()}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceSettlementAccountPage.displayName = 'WorkspaceSettlementAccountPage';

export default WorkspaceSettlementAccountPage;
