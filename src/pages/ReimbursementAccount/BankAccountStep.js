import React from 'react';
import {
    View, ScrollView, TouchableWithoutFeedback, Linking,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import BankAccountManualStep from './BankAccountManualStep';
import BankAccountPlaidStep from './BankAccountPlaidStep';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import * as Expensicons from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import TextLink from '../../components/TextLink';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import withLocalize from '../../components/withLocalize';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import getPlaidDesktopMessage from '../../libs/getPlaidDesktopMessage';
import CONFIG from '../../CONFIG';
import ROUTES from '../../ROUTES';
import Button from '../../components/Button';
import ScreenWrapper from '../../components/ScreenWrapper';
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
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    user: {},
};

const BankAccountStep = (props) => {
    let subStep = props.getDefaultStateForField('subStep', '');
    const shouldReinitializePlaidLink = props.plaidLinkOAuthToken && props.receivedRedirectURI && subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}`;

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
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={props.translate('workspace.common.bankAccount')}
                    stepCounter={subStep ? {step: 1, total: 5} : undefined}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={props.onBackButtonPress}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                <ScrollView style={[styles.flex1]}>
                    <Section
                        icon={Illustrations.MoneyWings}
                        title={props.translate('workspace.bankAccount.streamlinePayments')}
                    >
                        <View style={[styles.mv3]}>
                            <Text>{props.translate('bankAccount.toGetStarted')}</Text>
                        </View>
                        {plaidDesktopMessage && (
                            <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                                <TextLink href={bankAccountRoute}>
                                    {props.translate(plaidDesktopMessage)}
                                </TextLink>
                            </View>
                        )}
                        <Button
                            icon={Expensicons.Bank}
                            text={props.translate('bankAccount.connectOnlineWithPlaid')}
                            onPress={BankAccounts.openPlaidView}
                            disabled={props.isPlaidDisabled || !props.user.validated}
                            style={[styles.mt4]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            success
                            large
                        />
                        {props.error && (
                            <Text style={[styles.formError, styles.mh5]}>
                                {props.error}
                            </Text>
                        )}
                        <View style={[styles.mv3]}>
                            <MenuItem
                                icon={Expensicons.Connect}
                                title={props.translate('bankAccount.connectManually')}
                                disabled={!props.user.validated}
                                onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL)}
                                shouldShowRightIcon
                                iconFill={themeColors.success}
                                wrapperStyle={[styles.cardMenuItem]}
                            />
                        </View>
                    </Section>
                    {!props.user.validated && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                            <Icon src={Expensicons.Exclamation} fill={colors.red} />
                            <Text style={[styles.mutedTextLabel, styles.ml4, styles.flex1]}>
                                {props.translate('bankAccount.validateAccountError')}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink href="https://use.expensify.com/privacy">
                            {props.translate('common.privacy')}
                        </TextLink>
                        <TouchableWithoutFeedback
                            // eslint-disable-next-line max-len
                            onPress={() => Linking.openURL('https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/')}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.cursorPointer]}>
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/"
                                >
                                    {props.translate('bankAccount.yourDataIsSecure')}
                                </TextLink>
                                <View style={[styles.ml1]}>
                                    <Icon src={Expensicons.Lock} fill={colors.blue} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>

    );
};

BankAccountStep.propTypes = propTypes;
BankAccountStep.defaultProps = defaultProps;
BankAccountStep.displayName = 'BankAccountStep';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
        isPlaidDisabled: {
            key: ONYXKEYS.IS_PLAID_DISABLED,
        },
    }),
)(BankAccountStep);
