import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as CardUtils from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as Card from '@userActions/Card';
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

    const policyID = route?.params?.policyID ?? '-1';

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    const getVerificationState = () => {
        if (cardOnWaitlist) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST;
        }
        if (cardSettings?.isSuccess) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED;
        }

        if (cardSettings?.isLoading) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING;
        }

        return '';
    };

    const handleAddBankAccount = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('new', policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };

    const handleSelectBankAccount = (value?: number) => {
        Card.configureExpensifyCardsForPolicy(policyID, value);
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

    const verificationState = getVerificationState();
    const isInVerificationState = !!verificationState;

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
                    />
                );
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
                return (
                    <>
                        <BlockingView
                            title={translate('workspace.expensifyCard.oneMoreStep')}
                            subtitle={translate('workspace.expensifyCard.oneMoreStepDescription')}
                            icon={Illustrations.Puzzle}
                            subtitleStyle={styles.textLabelSupporting}
                            iconHeight={variables.cardPreviewHeight}
                            iconWidth={variables.cardPreviewHeight}
                        />
                        <Button
                            success
                            large
                            text={translate('workspace.expensifyCard.goToConcierge')}
                            style={[styles.m5]}
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
                            style={[styles.m5]}
                            pressOnEnter
                            onPress={() => {
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
                testID={WorkspaceExpensifyCardBankAccounts.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <HeaderWithBackButton
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        title={getHeaderButtonText()}
                    />
                    {isInVerificationState && renderVerificationStateView()}
                    {!isInVerificationState && (
                        <FullPageOfflineBlockingView>
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

WorkspaceExpensifyCardBankAccounts.displayName = 'WorkspaceExpensifyCardBankAccounts';

export default WorkspaceExpensifyCardBankAccounts;
