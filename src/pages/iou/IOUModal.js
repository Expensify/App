import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import {createIOUSplit, createIOUTransaction, getPreferredCurrency} from '../../libs/actions/IOU';
import {Close, BackArrow} from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    // Is this new IOU for a single request or group bill split?
    hasMultipleParticipants: PropTypes.bool,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (creating the IOU Report)
        loading: PropTypes.bool,

        // Whether or not transaction creation has started
        creatingIOUTransaction: PropTypes.bool,

        // Whether or not transaction creation has resulted to error
        error: PropTypes.bool,
    }).isRequired,


};

const defaultProps = {
    hasMultipleParticipants: false,
};

// Determines type of step to display within Modal, value provides the title for that page.
const Steps = {
    IOUAmount: 'Amount',
    IOUParticipants: 'Participants',
    IOUConfirm: 'Confirm',
};

// The steps to be shown within the create IOU flow.
const steps = [Steps.IOUAmount, Steps.IOUParticipants, Steps.IOUConfirm];

class IOUModal extends Component {
    constructor(props) {
        super(props);

        this.navigateToPreviousStep = this.navigateToPreviousStep.bind(this);
        this.navigateToNextStep = this.navigateToNextStep.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.currencySelected = this.currencySelected.bind(this);
        this.createTransaction = this.createTransaction.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.addParticipants = this.addParticipants.bind(this);

        this.state = {
            currentStepIndex: 0,
            participants: [],

            // amount is currency in decimal format
            amount: '',
            selectedCurrency: 'USD',
            isAmountPageNextButtonDisabled: true,
            comment: '',
        };
    }

    componentDidMount() {
        getPreferredCurrency();
    }

    componentDidUpdate(prevProps) {
        // Successfully close the modal if transaction creation has ended and theree is no error
        if (prevProps.iou.creatingIOUTransaction && !this.props.iou.creatingIOUTransaction && !this.props.iou.error) {
            Navigation.dismissModal();
        }
    }

    /**
     * Retrieve title for current step, based upon current step and type of IOU
     *
     * @returns {String}
     */

    getTitleForStep() {
        const currentStepIndex = this.state.currentStepIndex;
        if (currentStepIndex === 1 || currentStepIndex === 2) {
            return `${this.props.hasMultipleParticipants ? 'Split' : 'Request'} $${this.state.amount}`;
        }
        if (steps[currentStepIndex] === Steps.IOUAmount) {
            return this.props.hasMultipleParticipants ? 'Split Bill' : 'Request Money';
        }
        return steps[currentStepIndex] || '';
    }

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
            currentStepIndex: prevState.currentStepIndex - 1,
        }));
    }

    /**
     * Navigate to the previous IOU step if possible
     */
    navigateToNextStep() {
        if (this.state.currentStepIndex >= steps.length - 1) {
            return;
        }
        this.setState(prevState => ({
            currentStepIndex: prevState.currentStepIndex + 1,
        }));
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
     * Update amount with number or Backspace pressed.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} buttonPressed
     */
    updateAmount(buttonPressed) {
        // Backspace button is pressed
        if (buttonPressed === '<' || buttonPressed === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState(prevState => ({
                    amount: prevState.amount.substring(0, prevState.amount.length - 1),
                    isAmountPageNextButtonDisabled: prevState.amount.length === 1,
                }));
            }
        } else {
            const decimalNumberRegex = new RegExp(/^\d{1,6}(\.\d{0,2})?$/, 'i');
            const amount = this.state.amount + buttonPressed;
            if (decimalNumberRegex.test(amount)) {
                this.setState({
                    amount,
                    isAmountPageNextButtonDisabled: false,
                });
            }
        }
    }

    /**
     * Update the currency state
     *
     * @param {String} selectedCurrency
     */
    currencySelected(selectedCurrency) {
        this.setState({selectedCurrency});
    }

    closeModal() {
        Navigation.dismissModal();
    }

    createTransaction({debtorEmail, splits, participants}) {
        if (debtorEmail) {
            return createIOUTransaction({
                comment: this.state.comment,

                // should send in cents to API
                amount: this.state.amount * 100,
                currency: this.state.selectedCurrency,
                debtorEmail,
                setIsTransactionComplete: this.setIsTransactionComplete,
            });
        }
        return createIOUSplit({
            comment: this.state.comment,

            // should send in cents to API
            amount: this.state.amount * 100,
            currency: this.state.selectedCurrency,
            splits,
            participants,
        });
    }

    render() {
        const currentStep = steps[this.state.currentStepIndex];
        return (
            <>
                <View style={[styles.headerBar, true && styles.borderBottom]}>
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
                            <TouchableOpacity
                                onPress={this.navigateToPreviousStep}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={BackArrow} />
                            </TouchableOpacity>
                        )}
                        <Header title={this.getTitleForStep()} />
                        <View style={[styles.reportOptions, styles.flexRow]}>
                            <TouchableOpacity
                                onPress={Navigation.dismissModal}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={Close} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {currentStep === Steps.IOUAmount && (
                    <IOUAmountPage
                        onStepComplete={this.navigateToNextStep}
                        numberPressed={this.updateAmount}
                        currencySelected={this.currencySelected}
                        amount={this.state.amount}
                        selectedCurrency={this.state.selectedCurrency}
                        isNextButtonDisabled={this.state.isAmountPageNextButtonDisabled}
                    />
                )}
                {currentStep === Steps.IOUParticipants && (
                    <IOUParticipantsPage
                        participants={this.state.participants}
                        hasMultipleParticipants={this.props.hasMultipleParticipants}
                        onAddParticipants={this.addParticipants}
                        onStepComplete={this.navigateToNextStep}
                    />
                )}
                {currentStep === Steps.IOUConfirm && (
                    <IOUConfirmPage
                        onConfirm={this.createTransaction}
                        hasMultipleParticipants={this.props.hasMultipleParticipants}
                        participants={this.state.participants}
                        iouAmount={this.state.amount}
                        comment={this.state.comment}
                        selectedCurrency={this.state.selectedCurrency}
                        onUpdateComment={this.updateComment}
                    />
                )}
            </>
        );
    }
}

IOUModal.propTypes = propTypes;
IOUModal.defaultProps = defaultProps;
IOUModal.displayName = 'IOUModal';

export default withOnyx({
    iousReport: {
        key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    },
    iou: {key: ONYXKEYS.IOU},
})(IOUModal);
