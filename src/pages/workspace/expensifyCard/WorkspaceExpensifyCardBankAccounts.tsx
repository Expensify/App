import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
import variables from '@styles/variables';
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
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: false});

    const policyID = route?.params?.policyID;
    const policy = usePolicy(policyID);

    const illustrations = useMemoizedLazyIllustrations(['Puzzle']);

    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    const defaultFundID = useDefaultFundID(policyID);

    const [cardBankAccountMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA}${defaultFundID}`, {canBeMissing: true});
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`, {canBeMissing: true});

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
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
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
    const isInVerificationState = !!verificationState;

    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true});

    const renderVerificationStateView = () => {
        switch (verificationState) {
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return (
                    <BlockingView
                        title={translate('workspace.expensifyCard.verifyingBankAccount')}
                        subtitle={translate('workspace.expensifyCard.verifyingBankAccountDescription')}
                        animation={LottieAnimations.ReviewingBankInfo}
                        animationStyles={styles.loadingVBAAnimation}
                        animationWebStyle={styles.loadingVBAAnimationWeb}
                        subtitleStyle={styles.textLabelSupporting}
                        containerStyle={styles.pb20}
                        addBottomSafeAreaPadding
                    />
                );
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
                return (
                    <>
                        <BlockingView
                            title={translate('workspace.expensifyCard.oneMoreStep')}
                            subtitle={translate('workspace.expensifyCard.oneMoreStepDescription')}
                            icon={illustrations.Puzzle}
                            subtitleStyle={styles.textLabelSupporting}
                            iconHeight={variables.cardPreviewHeight}
                            iconWidth={variables.cardPreviewHeight}
                        />
                        <Button
                            success
                            large
                            text={translate('workspace.expensifyCard.goToConcierge')}
                            style={[styles.m5, bottomSafeAreaPaddingStyle]}
                            pressOnEnter
                            onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                        />
                    </>
                );
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
                return (
                    <>
                        <BlockingView
                            title={translate('workspace.expensifyCard.bankAccountVerified')}
                            subtitle={translate('workspace.expensifyCard.bankAccountVerifiedDescription')}
                            animation={LottieAnimations.Fireworks}
                            animationStyles={styles.loadingVBAAnimation}
                            animationWebStyle={styles.loadingVBAAnimationWeb}
                            subtitleStyle={styles.textLabelSupporting}
                        />
                        <Button
                            success
                            large
                            text={translate('workspace.expensifyCard.gotIt')}
                            style={[styles.m5, bottomSafeAreaPaddingStyle]}
                            pressOnEnter
                            onPress={() => {
                                setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
                                Navigation.dismissModal();
                                Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
                            }}
                        />
                    </>
                );
            default:
                return null;
        }
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
                    {isInVerificationState && renderVerificationStateView()}
                    {!isInVerificationState && (
                        <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                            <View style={styles.flex1}>
                                <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                                {renderBankOptions()}
                                <MenuItem
                                    icon={Expensicons.Plus}
                                    title={translate('workspace.expensifyCard.addNewBankAccount')}
                                    onPress={handleAddBankAccount}
                                />
                            </View>
                        </FullPageOfflineBlockingView>
                    )}
                </DelegateNoAccessWrapper>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardBankAccounts;
