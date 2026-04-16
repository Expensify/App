import React from 'react';
import {View} from 'react-native';
import BankAccountVerificationView from '@components/BankAccountVerificationView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard, getEligibleBankAccountsForUkEuCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {configureExpensifyCardsForPolicy, setIssueNewCardStepAndData} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceExpensifyCardBankAccountsProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT>;

function WorkspaceExpensifyCardBankAccounts({route}: WorkspaceExpensifyCardBankAccountsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const policyID = route?.params?.policyID;
    const policy = usePolicy(policyID);

    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    const defaultFundID = useDefaultFundID(policyID);

    const [cardBankAccountMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA}${defaultFundID}`);
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    const getVerificationState = () => {
        if (cardOnWaitlist) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST;
        }
        if (cardBankAccountMetadata?.isSuccess) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED;
        }

        if (cardBankAccountMetadata?.isLoading) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING;
        }

        return '';
    };

    const handleAddBankAccount = () => {
        Navigation.navigate(
            ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                policyID,
                stepToOpen: REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID),
            }),
        );
    };

    const handleSelectBankAccount = (value?: number) => {
        configureExpensifyCardsForPolicy(policyID, policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID, value);
    };

    const renderBankOptions = () => {
        if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
            return null;
        }

        const eligibleBankAccounts = isUkEuCurrencySupported
            ? getEligibleBankAccountsForUkEuCard(bankAccountsList, policy?.outputCurrency)
            : getEligibleBankAccountsForCard(bankAccountsList);

        return eligibleBankAccounts.map((bankAccount) => {
            const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount?.methodID;

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

            return (
                <MenuItem
                    key={bankAccountID}
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

    const verificationState = getVerificationState();

    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const handleVerifiedButtonPress = () => {
        if (!policyID) {
            return;
        }
        setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
        Navigation.dismissModal();
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
    };

    const getHeaderButtonText = () => {
        switch (verificationState) {
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return translate('workspace.expensifyCard.verifyingHeader');
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
                return translate('workspace.expensifyCard.bankAccountVerifiedHeader');
            default:
                return translate('workspace.expensifyCard.chooseBankAccount');
        }
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardBankAccounts"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]}>
                    <HeaderWithBackButton
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        title={getHeaderButtonText()}
                    />
                    <BankAccountVerificationView
                        verificationState={verificationState}
                        onVerifiedButtonPress={handleVerifiedButtonPress}
                    >
                        <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                            <View style={styles.flex1}>
                                <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                                {renderBankOptions()}
                                <MenuItem
                                    icon={icons.Plus}
                                    title={translate('workspace.expensifyCard.addNewBankAccount')}
                                    onPress={handleAddBankAccount}
                                />
                            </View>
                        </FullPageOfflineBlockingView>
                    </BankAccountVerificationView>
                </DelegateNoAccessWrapper>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardBankAccounts;
