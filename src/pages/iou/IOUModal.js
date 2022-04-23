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
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import ROUTES from '../../ROUTES';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    /** Whether the IOU is for a single request or a group bill split */
    hasMultipleParticipants: PropTypes.bool,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string,

    /** The report passed via the route */
    report: PropTypes.shape({
        /** Participants associated with current report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Local Currency Code of the current user
        localCurrencyCode: PropTypes.string,
    }),

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    hasMultipleParticipants: false,
    report: {
        participants: [],
    },
    myPersonalDetails: {
        localCurrencyCode: CONST.CURRENCY.USD,
    },
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
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
            alternateText: Str.isSMSLogin(personalDetails.login) ? Str.removeSMSDomain(personalDetails.login) : personalDetails.login,
            icons: [personalDetails.avatar],
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
        PersonalDetails.fetchLocalCurrency();
        IOU.setIOUSelectedCurrency(this.props.myPersonalDetails.localCurrencyCode);
    }

    componentDidUpdate(prevProps) {
        // Successfully close the modal if transaction creation has ended and there is no error
        if (prevProps.iou.creatingIOUTransaction && !this.props.iou.creatingIOUTransaction && !this.props.iou.error) {
            Navigation.dismissModal();
        }

        // If transaction fails, handling it here
        if (prevProps.iou.creatingIOUTransaction && this.props.iou.error === true) {
            // Navigating to Enter Amount Page
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({currentStepIndex: 0});
        }

        if (prevProps.iou.selectedCurrencyCode !== this.props.iou.selectedCurrencyCode) {
            IOU.setIOUSelectedCurrency(this.props.iou.selectedCurrencyCode);
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
        const comment = this.state.comment;

        const newIOUReportDetails = JSON.stringify({
            amount,
            currency,
            requestorEmail: this.state.participants[0].login,
            comment,
            idempotencyKey: Str.guid(),
        });

        IOU.payIOUReport({
            chatReportID: lodashGet(this.props, 'route.params.reportID', ''),
            reportID: 0,
            paymentMethodType,
            amount,
            currency,
            requestorPayPalMeAddress: this.state.participants[0].payPalMeAddress,
            requestorPhoneNumber: this.state.participants[0].phoneNumber,
            comment,
            newIOUReportDetails,
        })
            .finally(() => {
                Navigation.navigate(ROUTES.REPORT);
            });
    }

    /**
     * Create the IOU transaction
     *
     * @param {Array} [splits]
     */
    createTransaction(splits) {
        const reportID = lodashGet(this.props, 'route.params.reportID', '');

        // Only splits from a group DM has a reportID
        // Check if reportID is a number
        if (splits && CONST.REGEX.NUMBER.test(reportID)) {
            IOU.createIOUSplitGroup({
                comment: this.state.comment,

                // should send in cents to API
                amount: Math.round(this.state.amount * 100),
                currency: this.props.iou.selectedCurrencyCode,
                splits,
                reportID,
            });
            return;
        }

        if (splits) {
            IOU.createIOUSplit({
                comment: this.state.comment,

                // Send in cents to API.
                amount: Math.round(this.state.amount * 100),
                currency: this.props.iou.selectedCurrencyCode,
                splits,
            });
            return;
        }

        IOU.createIOUTransaction({
            comment: this.state.comment,

            // Send in cents to API.
            amount: Math.round(this.state.amount * 100),
            currency: this.props.iou.selectedCurrencyCode,
            debtorEmail: OptionsListUtils.addSMSDomainIfPhoneNumber(this.state.participants[0].login),
        });
    }

    render() {
        const currentStep = this.steps[this.state.currentStepIndex];
        const reportID = lodashGet(this.props, 'route.params.reportID', '');
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
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
                                        <Tooltip text={this.props.translate('common.back')}>
                                            <TouchableOpacity
                                                onPress={this.navigateToPreviousStep}
                                                style={[styles.touchableButtonImage]}
                                            >
                                                <Icon src={Expensicons.BackArrow} />
                                            </TouchableOpacity>
                                        </Tooltip>
                                    )}
                                <Header title={this.getTitleForStep()} />
                                <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                                    <Tooltip text={this.props.translate('common.close')}>
                                        <TouchableOpacity
                                            onPress={() => Navigation.dismissModal()}
                                            style={[styles.touchableButtonImage, styles.mr0]}
                                            accessibilityRole="button"
                                            accessibilityLabel={this.props.translate('common.close')}
                                        >
                                            <Icon src={Expensicons.Close} />
                                        </TouchableOpacity>
                                    </Tooltip>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.pRelative, styles.flex1]}>
                            {!didScreenTransitionEnd && <FullScreenLoadingIndicator />}
                            {didScreenTransitionEnd && (
                                <>
                                    {currentStep === Steps.IOUAmount && (
                                        <AnimatedStep
                                            direction={this.getDirection()}
                                            style={[styles.flex1, styles.pageWrapper]}
                                        >
                                            <IOUAmountPage
                                                onStepComplete={(amount) => {
                                                    this.setState({amount});
                                                    this.navigateToNextStep();
                                                }}
                                                reportID={reportID}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                selectedAmount={this.state.amount}
                                                navigation={this.props.navigation}
                                            />
                                        </AnimatedStep>
                                    )}
                                    {currentStep === Steps.IOUParticipants && (
                                        <AnimatedStep
                                            style={[styles.flex1]}
                                            direction={this.getDirection()}
                                        >
                                            <IOUParticipantsPage
                                                participants={this.state.participants}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                onAddParticipants={this.addParticipants}
                                                onStepComplete={this.navigateToNextStep}
                                            />
                                        </AnimatedStep>
                                    )}
                                    {currentStep === Steps.IOUConfirm && (
                                        <AnimatedStep
                                            style={[styles.flex1]}
                                            direction={this.getDirection()}
                                        >
                                            <IOUConfirmPage
                                                onConfirm={this.createTransaction}
                                                onSendMoney={this.sendMoney}
                                                hasMultipleParticipants={this.props.hasMultipleParticipants}
                                                participants={this.state.participants}
                                                iouAmount={this.state.amount}
                                                comment={this.state.comment}
                                                onUpdateComment={this.updateComment}
                                                iouType={this.props.iouType}
                                                isIOUAttachedToExistingChatReport={!_.isEmpty(reportID)}
                                            />
                                        </AnimatedStep>
                                    )}
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        );
    }
}

IOUModal.propTypes = propTypes;
IOUModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
        iousReport: {
            key: ONYXKEYS.COLLECTION.REPORT_IOUS,
        },
        iou: {
            key: ONYXKEYS.IOU,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
    }),
)(IOUModal);
