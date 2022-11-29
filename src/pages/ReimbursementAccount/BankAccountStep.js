import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import BankAccountManualStep from './BankAccountManualStep';
import BankAccountPlaidStep from './BankAccountPlaidStep';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import * as Expensicons from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
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
import plaidDataPropTypes from './plaidDataPropTypes';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';

const propTypes = {
    /** Contains plaid data */
    plaidData: plaidDataPropTypes,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** Once the user has selected a sub step, clicking on back button should redirect to the continue button screen. */
    /** As such, we need to expose this handler */
    onSubStepBack: PropTypes.func,

    /** The bank account currently in setup */
    /* eslint-disable-next-line react/no-unused-prop-types */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Is the user account validated? */
        validated: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    plaidData: {
        isPlaidDisabled: false,
    },
    onSubStepBack: () => {},
    reimbursementAccount: {},
    user: {},
};

const BankAccountStep = (props) => {
    let subStep = lodashGet(props, 'reimbursementAccount.achData.subStep', '');
    const shouldReinitializePlaidLink = props.plaidLinkOAuthToken && props.receivedRedirectURI && subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    if (shouldReinitializePlaidLink) {
        subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}`;

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        return <BankAccountManualStep onBack={props.onSubStepBack} />;
    }

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        return <BankAccountPlaidStep onBack={props.onSubStepBack} />;
    }

    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
            <HeaderWithCloseButton
                title={props.translate('workspace.common.bankAccount')}
                stepCounter={subStep ? {step: 1, total: 5} : undefined}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={() => {
                    // If we have a subStep then we will remove otherwise we will go back
                    if (subStep) {
                        BankAccounts.setBankAccountSubStep(null);
                        return;
                    }
                    Navigation.goBack();
                }}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                shouldShowBackButton
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    icon={Illustrations.BankMouseGreen}
                    title={props.translate('workspace.bankAccount.streamlinePayments')}
                />
                <Text style={[styles.mh5, styles.mb1]}>
                    {props.translate('bankAccount.toGetStarted')}
                </Text>
                {plaidDesktopMessage && (
                    <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink href={bankAccountRoute}>
                            {props.translate(plaidDesktopMessage)}
                        </TextLink>
                    </View>
                )}
                <Button
                    icon={Expensicons.Bank}
                    text={props.translate('bankAccount.connectOnlineWithPlaid')}
                    onPress={() => {
                        BankAccounts.clearPlaid();
                        BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
                    }}
                    disabled={props.plaidData.isPlaidDisabled || !props.user.validated}
                    style={[styles.mt5, styles.buttonCTA]}
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
                <MenuItem
                    icon={Expensicons.Connect}
                    title={props.translate('bankAccount.connectManually')}
                    disabled={!props.user.validated}
                    onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL)}
                    shouldShowRightIcon
                />
                {!props.user.validated && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                        <Icon src={Expensicons.Exclamation} fill={colors.red} />
                        <Text style={[styles.mutedTextLabel, styles.ml4, styles.flex1]}>
                            {props.translate('bankAccount.validateAccountError')}
                        </Text>
                    </View>
                )}
                <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink href="https://use.expensify.com/privacy">
                        {props.translate('common.privacy')}
                    </TextLink>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
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
                </View>
            </ScrollView>
        </View>
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
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
    }),
)(BankAccountStep);
