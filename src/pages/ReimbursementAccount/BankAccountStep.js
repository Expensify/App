import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Link from '@userActions/Link';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BankAccountManualStep from './BankAccountManualStep';
import BankAccountPlaidStep from './BankAccountPlaidStep';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Is the user account validated? */
        validated: PropTypes.bool,
    }),

    /** If the plaid button has been disabled */
    isPlaidDisabled: PropTypes.bool,

    /* The workspace name */
    policyName: PropTypes.string,

    /* The workspace ID */
    policyID: PropTypes.string,
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    user: {},
    isPlaidDisabled: false,
    policyName: '',
    policyID: '',
};

function BankAccountStep(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    let subStep = lodashGet(props.reimbursementAccount, 'achData.subStep', '');
    const shouldReinitializePlaidLink = props.plaidLinkOAuthToken && props.receivedRedirectURI && subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(
        'new',
        props.policyID,
        ROUTES.WORKSPACE_INITIAL.getRoute(props.policyID),
    )}`;

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        return (
            <BankAccountManualStep
                reimbursementAccount={props.reimbursementAccount}
                reimbursementAccountDraft={props.reimbursementAccountDraft}
                onBackButtonPress={props.onBackButtonPress}
                getDefaultStateForField={props.getDefaultStateForField}
            />
        );
    }

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        return (
            <BankAccountPlaidStep
                reimbursementAccount={props.reimbursementAccount}
                reimbursementAccountDraft={props.reimbursementAccountDraft}
                onBackButtonPress={props.onBackButtonPress}
                getDefaultStateForField={props.getDefaultStateForField}
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
                    title={props.translate('workspace.common.connectBankAccount')}
                    subtitle={props.policyName}
                    stepCounter={subStep ? {step: 1, total: 5} : undefined}
                    onBackButtonPress={props.onBackButtonPress}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                />
                <ScrollView style={[styles.flex1]}>
                    <Section
                        icon={Illustrations.MoneyWings}
                        title={props.translate('workspace.bankAccount.streamlinePayments')}
                    >
                        <View style={[styles.mv3]}>
                            <Text>{props.translate('bankAccount.toGetStarted')}</Text>
                        </View>
                        {Boolean(plaidDesktopMessage) && (
                            <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                                <TextLink href={bankAccountRoute}>{props.translate(plaidDesktopMessage)}</TextLink>
                            </View>
                        )}
                        <Button
                            icon={Expensicons.Bank}
                            text={props.translate('bankAccount.connectOnlineWithPlaid')}
                            onPress={() => {
                                if (props.isPlaidDisabled || !props.user.validated) {
                                    return;
                                }
                                BankAccounts.openPlaidView();
                            }}
                            isDisabled={props.isPlaidDisabled || !props.user.validated}
                            style={[styles.mt4]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            success
                            large
                        />
                        {Boolean(props.error) && <Text style={[styles.formError, styles.mh5]}>{props.error}</Text>}
                        <View style={[styles.mv3]}>
                            <MenuItem
                                icon={Expensicons.Connect}
                                title={props.translate('bankAccount.connectManually')}
                                disabled={!props.user.validated}
                                onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL)}
                                shouldShowRightIcon
                                wrapperStyle={[styles.cardMenuItem]}
                            />
                        </View>
                    </Section>
                    {!props.user.validated && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                            <Icon
                                src={Expensicons.Exclamation}
                                fill={theme.danger}
                            />

                            <Text style={[styles.mutedTextLabel, styles.ml4, styles.flex1]}>{props.translate('bankAccount.validateAccountError')}</Text>
                        </View>
                    )}
                    <View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink href="https://use.expensify.com/privacy">{props.translate('common.privacy')}</TextLink>
                        <PressableWithoutFeedback
                            onPress={() => Link.openExternalLink('https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/')}
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessibilityLabel={props.translate('bankAccount.yourDataIsSecure')}
                        >
                            <TextLink href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/">
                                {props.translate('bankAccount.yourDataIsSecure')}
                            </TextLink>
                            <View style={[styles.ml1]}>
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

BankAccountStep.propTypes = propTypes;
BankAccountStep.defaultProps = defaultProps;
BankAccountStep.displayName = 'BankAccountStep';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        isPlaidDisabled: {
            key: ONYXKEYS.IS_PLAID_DISABLED,
        },
    }),
)(BankAccountStep);
