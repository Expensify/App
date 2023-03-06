import _ from 'underscore';
import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import * as IOU from '../../libs/actions/IOU';
import * as Expensicons from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import AnimatedStep from '../../components/AnimatedStep';
import ScreenWrapper from '../../components/ScreenWrapper';
import Tooltip from '../../components/Tooltip';
import CONST from '../../CONST';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import reportPropTypes from '../reportPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    /** Whether the IOU is for a single request or a group bill split */
    hasMultipleParticipants: PropTypes.bool,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string,

    /** The report passed via the route */
    // eslint-disable-next-line react/no-unused-prop-types
    report: reportPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({
        /** Whether or not transaction creation has started */
        creatingIOUTransaction: PropTypes.bool,

        /** Whether or not transaction creation has resulted to error */
        error: PropTypes.bool,

        /** Flag to show a loading indicator and avoid showing a previously selected currency */
        isRetrievingCurrency: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.shape({
        /** Primary login of participant */
        login: PropTypes.string,

        /** Display Name of participant */
        displayName: PropTypes.string,

        /** Avatar url of participant */
        avatar: PropTypes.string,
    }).isRequired,

    /** Personal details of the current user */
    currentUserPersonalDetails: PropTypes.shape({
        // Local Currency Code of the current user
        localCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    hasMultipleParticipants: false,
    report: {
        participants: [],
    },
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
    currentUserPersonalDetails: {
        localCurrencyCode: CONST.CURRENCY.USD,
    },
};

// Determines type of step to display within Modal, value provides the title for that page.
const Steps = {
    IOUAmount: 'iou.amount',
    IOUParticipants: 'iou.participants',
    IOUConfirm: 'iou.confirm',
};

class IOUModal extends Component {
    constructor(props) {
        super(props);
        this.navigateToPreviousStep = this.navigateToPreviousStep.bind(this);
        this.navigateToNextStep = this.navigateToNextStep.bind(this);
        this.addParticipants = this.addParticipants.bind(this);
        this.createTransaction = this.createTransaction.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.sendMoney = this.sendMoney.bind(this);

        const participants = lodashGet(props, 'report.participants', []);
        const participantsWithDetails = _.map(OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails), personalDetails => ({
            login: personalDetails.login,
            text: personalDetails.displayName,
            firstName: lodashGet(personalDetails, 'firstName', ''),
            lastName: lodashGet(personalDetails, 'lastName', ''),
            alternateText: Str.isSMSLogin(personalDetails.login) ? Str.removeSMSDomain(personalDetails.login) : personalDetails.login,
            icons: [{
                source: ReportUtils.getAvatar(personalDetails.avatar, personalDetails.login),
                name: personalDetails.login,
                type: CONST.ICON_TYPE_AVATAR,
            }],
            keyForList: personalDetails.login,
            payPalMeAddress: lodashGet(personalDetails, 'payPalMeAddress', ''),
            phoneNumber: lodashGet(personalDetails, 'phoneNumber', ''),
        }));

        this.state = {
            previousStepIndex: 0,
            currentStepIndex: 0,
            participants: participantsWithDetails,

            // amount is currency in decimal format
            amount: '',
            comment: '',
        };

        // Skip IOUParticipants step if participants are passed in
        if (participants.length) {
            // The steps to be shown within the create IOU flow.
            this.steps = [Steps.IOUAmount, Steps.IOUConfirm];
        } else {
            this.steps = [Steps.IOUAmount, Steps.IOUParticipants, Steps.IOUConfirm];
        }
    }

    componentDidMount() {
        PersonalDetails.openIOUModalPage();
        IOU.setIOUSelectedCurrency(this.props.currentUserPersonalDetails.localCurrencyCode);
    }

    componentDidUpdate(prevProps) {
        const wasCreatingIOUTransaction = lodashGet(prevProps, 'iou.creatingIOUTransaction');
        const iouError = lodashGet(this.props, 'iou.error');
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            PersonalDetails.openIOUModalPage();
        }

        // Successfully close the modal if transaction creation has ended and there is no error
        if (wasCreatingIOUTransaction && !lodashGet(this.props, 'iou.creatingIOUTransaction') && !iouError) {
            Navigation.dismissModal();
        }

        // If transaction fails, handling it here
        if (wasCreatingIOUTransaction && iouError === true) {
            // Navigating to Enter Amount Page
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({currentStepIndex: 0});
            this.creatingIOUTransaction = false;
        }

        const currentSelectedCurrencyCode = lodashGet(this.props, 'iou.selectedCurrencyCode');
        if (lodashGet(prevProps, 'iou.selectedCurrencyCode') !== currentSelectedCurrencyCode) {
            IOU.setIOUSelectedCurrency(currentSelectedCurrencyCode);
        }
    }

    /**
     * Decides our animation type based on whether we're increasing or decreasing
     * our step index.
     * @returns {String}
    */
    getDirection() {
        if (this.state.previousStepIndex < this.state.currentStepIndex) {
            return 'in';
        }
        if (this.state.previousStepIndex > this.state.currentStepIndex) {
            return 'out';
        }

        // Doesn't animate the step when first opening the modal
        if (this.state.previousStepIndex === this.state.currentStepIndex) {
            return null;
        }
    }

    /**
     * Retrieve title for current step, based upon current step and type of IOU
     *
     * @returns {String}
     */
    getTitleForStep() {
        const currentStepIndex = this.state.currentStepIndex;
        const isSendingMoney = this.props.iouType === CONST.IOU.IOU_TYPE.SEND;
        if (currentStepIndex === 1 || currentStepIndex === 2) {
            const formattedAmount = this.props.numberFormat(
                this.state.amount, {
                    style: 'currency',
                    currency: this.props.iou.selectedCurrencyCode,
                },
            );
            if (isSendingMoney) {
                return this.props.translate('iou.send', {
                    amount: formattedAmount,
                });
            }
            return this.props.translate(
                this.props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                    amount: formattedAmount,
                },
            );
        }
        if (currentStepIndex === 0) {
            if (isSendingMoney) {
                return this.props.translate('iou.sendMoney');
            }
            return this.props.translate(this.props.hasMultipleParticipants ? 'iou.splitBill' : 'iou.requestMoney');
        }

        return this.props.translate(this.steps[currentStepIndex]) || '';
    }

    /**
     * Update comment whenever user enters any new text
     *
     * @param {String} comment
     */
    updateComment(comment) {
        this.setState({
            comment,
        });
    }

    /**
     * Update participants whenever user selects the payment recipient
     *
     * @param {Array} participants
     */
    addParticipants(participants) {
        this.setState({
            participants,
        });
    }

    /**
     * Navigate to the next IOU step if possible
     */
    navigateToPreviousStep() {
        if (this.state.currentStepIndex <= 0) {
            return;
        }
        this.setState(prevState => ({
            previousStepIndex: prevState.currentStepIndex,
            currentStepIndex: prevState.currentStepIndex - 1,
        }));
    }

    /**
     * Navigate to the previous IOU step if possible
     */
    navigateToNextStep() {
        if (this.state.currentStepIndex >= this.steps.length - 1) {
            return;
        }

        this.setState(prevState => ({
            previousStepIndex: prevState.currentStepIndex,
            currentStepIndex: prevState.currentStepIndex + 1,
        }));
    }

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    sendMoney(paymentMethodType) {
        const amount = Math.round(this.state.amount * 100);
        const currency = this.props.iou.selectedCurrencyCode;
        const comment = this.state.comment.trim();
        const participant = this.state.participants[0];

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            IOU.sendMoneyElsewhere(
                this.props.report,
                amount,
                currency,
                comment,
                this.props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
            IOU.sendMoneyViaPaypal(
                this.props.report,
                amount,
                currency,
                comment,
                this.props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            IOU.sendMoneyWithWallet(
                this.props.report,
                amount,
                currency,
                comment,
                this.props.currentUserPersonalDetails.login,
                participant,
            );
        }
    }

    /**
     * @param {Array} selectedParticipants
     */
    createTransaction(selectedParticipants) {
        const reportID = lodashGet(this.props, 'route.params.reportID', '');
        const comment = this.state.comment.trim();

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (this.props.hasMultipleParticipants && CONST.REGEX.NUMBER.test(reportID)) {
            IOU.splitBill(
                selectedParticipants,
                this.props.currentUserPersonalDetails.login,
                this.state.amount,
                comment,
                this.props.iou.selectedCurrencyCode,
                this.props.preferredLocale,
                reportID,
            );
            return;
        }

        // If the IOU is created from the global create menu, we also navigate the user to the group report
        if (this.props.hasMultipleParticipants) {
            IOU.splitBillAndOpenReport(
                selectedParticipants,
                this.props.currentUserPersonalDetails.login,
                this.state.amount,
                comment,
                this.props.iou.selectedCurrencyCode,
                this.props.preferredLocale,
            );
            return;
        }
        IOU.requestMoney(
            this.props.report,
            Math.round(this.state.amount * 100),
            this.props.iou.selectedCurrencyCode,
            this.props.currentUserPersonalDetails.login,
            selectedParticipants[0],
            comment,
        );
    }

    renderHeader() {
        return (
            <View style={[styles.headerBar]}>
                <View style={[
                    styles.dFlex,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.flexGrow1,
                    styles.justifyContentBetween,
                    styles.overflowHidden,
                ]}
                >
                    {this.state.currentStepIndex > 0
                        && (
                        <View style={[styles.mr2]}>
                            <Tooltip text={this.props.translate('common.back')}>
                                <TouchableOpacity
                                    onPress={this.navigateToPreviousStep}
                                    style={[styles.touchableButtonImage]}
                                >
                                    <Icon src={Expensicons.BackArrow} />
                                </TouchableOpacity>
                            </Tooltip>
                        </View>
                        )}
                    <Header title={this.getTitleForStep()} />
                    <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                        <Tooltip text={this.props.translate('common.close')}>
                            <TouchableOpacity
                                onPress={() => Navigation.dismissModal()}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole="button"
                                accessibilityLabel={this.props.translate('common.close')}
                            >
                                <Icon src={Expensicons.Close} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        const currentStep = this.steps[this.state.currentStepIndex];
        const reportID = lodashGet(this.props, 'route.params.reportID', '');
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                    <>
                        <View style={[styles.pRelative, styles.flex1]}>
                            {!didScreenTransitionEnd && <FullScreenLoadingIndicator />}
                            {didScreenTransitionEnd && (
                                <>
                                    {currentStep === Steps.IOUAmount && (
                                        <AnimatedStep
                                            direction={this.getDirection()}
                                            style={[styles.flex1, safeAreaPaddingBottomStyle]}
                                        >
                                            {this.renderHeader()}
                                            <IOUAmountPage
                                                onStepComplete={(amount) => {
                                                    this.setState({amount});
                                                    this.navigateToNextStep();
                                                }}
                                                reportID={reportID}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                selectedAmount={this.state.amount}
                                                navigation={this.props.navigation}
                                                iouType={this.props.iouType}
                                            />
                                        </AnimatedStep>
                                    )}
                                    {currentStep === Steps.IOUParticipants && (
                                        <AnimatedStep
                                            style={[styles.flex1]}
                                            direction={this.getDirection()}
                                        >
                                            {this.renderHeader()}
                                            <IOUParticipantsPage
                                                participants={this.state.participants}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                onAddParticipants={this.addParticipants}
                                                onStepComplete={this.navigateToNextStep}
                                                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                                            />
                                        </AnimatedStep>
                                    )}
                                    {currentStep === Steps.IOUConfirm && (
                                        <AnimatedStep
                                            style={[styles.flex1, safeAreaPaddingBottomStyle]}
                                            direction={this.getDirection()}
                                        >
                                            {this.renderHeader()}
                                            <IOUConfirmPage
                                                onConfirm={(selectedParticipants) => {
                                                    // Prevent creating multiple transactions if the button is pressed repeatedly
                                                    if (this.creatingIOUTransaction) {
                                                        return;
                                                    }
                                                    this.creatingIOUTransaction = true;
                                                    this.createTransaction(selectedParticipants);
                                                }}
                                                onSendMoney={(paymentMethodType) => {
                                                    if (this.creatingIOUTransaction) {
                                                        return;
                                                    }
                                                    this.creatingIOUTransaction = true;
                                                    this.sendMoney(paymentMethodType);
                                                }}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                participants={_.filter(this.state.participants, email => this.props.currentUserPersonalDetails.login !== email.login)}
                                                iouAmount={this.state.amount}
                                                comment={this.state.comment}
                                                onUpdateComment={this.updateComment}
                                                iouType={this.props.iouType}

                                                // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                                                // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                                                // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                                                // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                                                // the floating-action-button (since it is something that exists outside the context of a report).
                                                canModifyParticipants={!_.isEmpty(reportID)}
                                            />
                                        </AnimatedStep>
                                    )}
                                </>
                            )}
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

IOUModal.propTypes = propTypes;
IOUModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withCurrentUserPersonalDetails,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
        iou: {
            key: ONYXKEYS.IOU,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(IOUModal);
