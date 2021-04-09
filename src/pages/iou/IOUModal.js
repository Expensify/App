import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import {getPreferredCurrency} from '../../libs/actions/IOU';
import {Close, BackArrow} from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    // Whether the IOU is for a single request or a group bill split
    hasMultipleParticipants: PropTypes.bool,

    // The report passed via the route
    report: PropTypes.shape({
        // Participants associated with current report
        participants: PropTypes.arrayOf(PropTypes.string),
    }),
};

const defaultProps = {
    hasMultipleParticipants: false,
    report: {
        participants: [],
    },
};

// Determines type of step to display within Modal, value provides the title for that page.
const Steps = {
    IOUAmount: 'Amount',
    IOUParticipants: 'Participants',
    IOUConfirm: 'Confirm',
};

class IOUModal extends Component {
    constructor(props) {
        super(props);
        this.navigateToPreviousStep = this.navigateToPreviousStep.bind(this);
        this.navigateToNextStep = this.navigateToNextStep.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.currencySelected = this.currencySelected.bind(this);
        this.addParticipants = this.addParticipants.bind(this);
        const participants = lodashGet(props, 'report.participants', []);

        this.state = {
            currentStepIndex: 0,
            participants,
            amount: '',
            selectedCurrency: 'USD',
            isAmountPageNextButtonDisabled: true,
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
        getPreferredCurrency();
    }

    /**
     * Retrieve title for current step, based upon current step and type of IOU
     *
     * @returns {String}
     */
    getTitleForStep() {
        if (this.state.currentStepIndex === 1) {
            return `${this.props.hasMultipleParticipants ? 'Split' : 'Request'} $${this.state.amount}`;
        }
        if (this.steps[this.state.currentStepIndex] === Steps.IOUAmount) {
            return this.props.hasMultipleParticipants ? 'Split Bill' : 'Request Money';
        }
        return this.steps[this.state.currentStepIndex] || '';
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
        if (this.state.currentStepIndex >= this.steps.length - 1) {
            return;
        }
        this.setState(prevState => ({
            currentStepIndex: prevState.currentStepIndex + 1,
        }));
    }

    addParticipants(participants) {
        this.setState({
            participants,
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

    render() {
        const currentStep = this.steps[this.state.currentStepIndex];
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
                        onConfirm={() => console.debug('create IOU report')}
                        participants={this.state.participants}
                        iouAmount={this.state.amount}
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
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(IOUModal);
