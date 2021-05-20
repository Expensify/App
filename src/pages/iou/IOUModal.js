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
import {createIOUSplit, createIOUTransaction, getPreferredCurrency} from '../../libs/actions/IOU';
import {Close, BackArrow} from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import {getPersonalDetailsForLogins} from '../../libs/OptionsListUtils';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    /** Whether the IOU is for a single request or a group bill split */
    hasMultipleParticipants: PropTypes.bool,

    /** The report passed via the route */
    report: PropTypes.shape({
        /** Participants associated with current report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Preferred Currency Code of the current user
        preferredCurrencyCode: PropTypes.string,

        // Currency Symbol of the Preferred Currency
        preferredCurrencySymbol: PropTypes.string,
    }),

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({
        /** Whether or not transaction creation has started */
        creatingIOUTransaction: PropTypes.bool,

        /** Whether or not transaction creation has resulted to error */
        error: PropTypes.bool,
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
        preferredCurrencyCode: 'USD',
        preferredCurrencySymbol: '$',
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
        this.currencySelected = this.currencySelected.bind(this);
        this.addParticipants = this.addParticipants.bind(this);
        this.createTransaction = this.createTransaction.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.addParticipants = this.addParticipants.bind(this);
        const participants = lodashGet(props, 'report.participants', []);
        const participantsWithDetails = getPersonalDetailsForLogins(participants, props.personalDetails)
            .map(personalDetails => ({
                login: personalDetails.login,
                text: personalDetails.displayName,
                alternateText: personalDetails.login,
                icons: [personalDetails.avatar],
                keyForList: personalDetails.login,
            }));

        this.state = {
            currentStepIndex: 0,
            participants: participantsWithDetails,

            // amount is currency in decimal format
            amount: '',
            selectedCurrency: {
                currencyCode: props.myPersonalDetails.preferredCurrencyCode,
                currencySymbol: props.myPersonalDetails.preferredCurrencySymbol,
            },
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
        getPreferredCurrency();
    }

    componentDidUpdate(prevProps) {
        // Successfully close the modal if transaction creation has ended and there is no error
        if (prevProps.iou.creatingIOUTransaction && !this.props.iou.creatingIOUTransaction && !this.props.iou.error) {
            Navigation.dismissModal();
        }

        if (prevProps.myPersonalDetails.preferredCurrencyCode
            !== this.props.myPersonalDetails.preferredCurrencyCode) {
            this.updateSelectedCurrency({
                currencyCode: this.props.myPersonalDetails.preferredCurrencyCode,
                currencySymbol: this.props.myPersonalDetails.preferredCurrencySymbol,
            });
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
            return this.props.translate(
                this.props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                    amount: this.props.numberFormat(
                        this.state.amount, {
                            style: 'currency',
                            currency: this.state.selectedCurrency.currencyCode,
                        },
                    ),
                },
            );
        }
        if (currentStepIndex === 0) {
            return this.props.translate(this.props.hasMultipleParticipants ? 'iou.splitBill' : 'iou.requestMoney');
        }

        return this.props.translate(this.steps[currentStepIndex]) || '';
    }

    addParticipants(participants) {
        this.setState({
            participants,
        });
    }

    /**
     * Update the selected currency
     * @param {Object} selectedCurrency
     */
    updateSelectedCurrency(selectedCurrency) {
        this.setState({
            selectedCurrency,
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
        if (this.state.currentStepIndex >= this.steps.length - 1) {
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
     * Update the currency state
     *
     * @param {String} selectedCurrency
     */
    currencySelected(selectedCurrency) {
        this.setState({selectedCurrency});
    }

    /**
     * @param {Array} [splits]
     */
    createTransaction(splits) {
        if (splits) {
            createIOUSplit({
                comment: this.state.comment,

                // should send in cents to API
                amount: this.state.amount * 100,
                currency: this.state.selectedCurrency.currencyCode,
                splits,
            });
            return;
        }

        createIOUTransaction({
            comment: this.state.comment,

            // should send in cents to API
            amount: this.state.amount * 100,
            currency: this.state.selectedCurrency.currencyCode,
            debtorEmail: this.state.participants[0].login,
        });
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
                                onPress={() => Navigation.dismissModal()}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={Close} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {currentStep === Steps.IOUAmount && (
                    <IOUAmountPage
                        onStepComplete={(amount) => {
                            this.setState({amount});
                            this.navigateToNextStep();
                        }}
                        currencySelected={this.currencySelected}
                        reportID={this.props.route.params.reportID}
                        selectedCurrency={this.state.selectedCurrency}
                        hasMultipleParticipants={this.props.hasMultipleParticipants}
                        selectedAmount={this.state.amount}
                        navigation={this.props.navigation}
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

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
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
