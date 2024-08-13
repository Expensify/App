import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Link from '@userActions/Link';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import BankInfo from './BankInfo/BankInfo';

type BankAccountStepOnyxProps = {
    /** Object with various information about the user */
    user: OnyxEntry<OnyxTypes.User>;

    /** If the plaid button has been disabled */
    isPlaidDisabled: OnyxEntry<boolean>;

    /** Login list for the user that is signed in */
    loginList: OnyxEntry<OnyxTypes.LoginList>;
};

type BankAccountStepProps = BankAccountStepOnyxProps & {
    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI?: string | null;

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken?: OnyxEntry<string>;

    /* The workspace name */
    policyName?: string;

    /* The workspace ID */
    policyID?: string;

    /** The bank account currently in setup */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const bankInfoStepKeys = INPUT_IDS.BANK_INFO_STEP;

function BankAccountStep({
    plaidLinkOAuthToken = '',
    policyID = '',
    policyName = '',
    user,
    receivedRedirectURI,
    reimbursementAccount,
    onBackButtonPress,
    loginList,
    isPlaidDisabled = false,
}: BankAccountStepProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    let subStep = reimbursementAccount?.achData?.subStep ?? '';
    const shouldReinitializePlaidLink = plaidLinkOAuthToken && receivedRedirectURI && subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('new', policyID, ROUTES.WORKSPACE_INITIAL.getRoute(policyID))}`;
    const loginNames = Object.keys(loginList ?? {});

    const removeExistingBankAccountDetails = () => {
        const bankAccountData: Partial<ReimbursementAccountForm> = {
            [bankInfoStepKeys.ROUTING_NUMBER]: '',
            [bankInfoStepKeys.ACCOUNT_NUMBER]: '',
            [bankInfoStepKeys.PLAID_MASK]: '',
            [bankInfoStepKeys.IS_SAVINGS]: undefined,
            [bankInfoStepKeys.BANK_NAME]: '',
            [bankInfoStepKeys.PLAID_ACCOUNT_ID]: '',
            [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: '',
        };
        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);
    };

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID || subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        return (
            <BankInfo
                onBackButtonPress={onBackButtonPress}
                policyID={policyID}
            />
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={BankAccountStep.displayName}
        >
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithBackButton
                    title={translate('workspace.common.connectBankAccount')}
                    subtitle={policyName}
                    stepCounter={subStep ? {step: 1, total: 5} : undefined}
                    onBackButtonPress={onBackButtonPress}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                />
                <ScrollView style={styles.flex1}>
                    <Section
                        icon={Illustrations.MoneyWings}
                        title={translate('workspace.bankAccount.streamlinePayments')}
                    >
                        <View style={styles.mv3}>
                            <Text>{translate('bankAccount.toGetStarted')}</Text>
                        </View>
                        {!!plaidDesktopMessage && (
                            <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                                <TextLink onPress={() => Link.openExternalLinkWithToken(bankAccountRoute)}>{translate(plaidDesktopMessage)}</TextLink>
                            </View>
                        )}
                        <Button
                            icon={Expensicons.Bank}
                            iconStyles={[styles.customMarginButtonWithMenuItem]}
                            text={translate('bankAccount.connectOnlineWithPlaid')}
                            onPress={() => {
                                if (!!isPlaidDisabled || !user?.validated) {
                                    return;
                                }
                                removeExistingBankAccountDetails();
                                BankAccounts.openPlaidView();
                            }}
                            isDisabled={!!isPlaidDisabled || !user?.validated}
                            style={[styles.mt4]}
                            shouldShowRightIcon
                            success
                            innerStyles={[styles.pr2, styles.pl4, styles.h13]}
                        />
                        <View style={styles.mv3}>
                            <MenuItem
                                icon={Expensicons.Connect}
                                title={translate('bankAccount.connectManually')}
                                disabled={!user?.validated}
                                onPress={() => {
                                    removeExistingBankAccountDetails();
                                    BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
                                }}
                                shouldShowRightIcon
                                wrapperStyle={[styles.cardMenuItem]}
                            />
                        </View>
                    </Section>
                    {!user?.validated && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                            <Icon
                                src={Expensicons.Exclamation}
                                fill={theme.danger}
                            />

                            <Text style={[styles.mutedTextLabel, styles.ml4, styles.flex1]}>
                                {translate('bankAccount.validateAccountError.phrase1')}
                                <TextLink
                                    fontSize={variables.fontSizeLabel}
                                    onPress={() => Session.signOutAndRedirectToSignIn()}
                                >
                                    {translate('bankAccount.validateAccountError.phrase2')}
                                </TextLink>
                                {translate('bankAccount.validateAccountError.phrase3')}
                                <TextLink
                                    fontSize={variables.fontSizeLabel}
                                    onPress={() => {
                                        const login = loginList?.[loginNames?.[0]] ?? {};
                                        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(login?.partnerUserID ?? loginNames?.[0]));
                                    }}
                                >
                                    {translate('bankAccount.validateAccountError.phrase4')}
                                </TextLink>
                                .
                            </Text>
                        </View>
                    )}
                    <View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink href={CONST.PRIVACY_URL}>{translate('common.privacy')}</TextLink>
                        <PressableWithoutFeedback
                            onPress={() => Link.openExternalLink('https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/')}
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessibilityLabel={translate('bankAccount.yourDataIsSecure')}
                        >
                            <TextLink href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/">
                                {translate('bankAccount.yourDataIsSecure')}
                            </TextLink>
                            <View style={styles.ml1}>
                                <Icon
                                    src={Expensicons.Lock}
                                    fill={theme.link}
                                />
                            </View>
                        </PressableWithoutFeedback>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

BankAccountStep.displayName = 'BankAccountStep';

export default withOnyx<BankAccountStepProps, BankAccountStepOnyxProps>({
    user: {
        key: ONYXKEYS.USER,
    },
    isPlaidDisabled: {
        key: ONYXKEYS.IS_PLAID_DISABLED,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(BankAccountStep);
