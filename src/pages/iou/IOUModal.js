import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import {getPreferredCurrency} from '../../libs/actions/IOU';
import {Close, BackArrow} from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    // Is this new IOU for a single request or group bill split?
    hasMultipleParticipants: PropTypes.bool,
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

        this.state = {
            currentStepIndex: 0,
        };
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
        return steps[this.state.currentStepIndex] || '';
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
                    <IOUAmountPage onStepComplete={this.navigateToNextStep} />
                )}
                {currentStep === Steps.IOUParticipants && (
                    <IOUParticipantsPage
                        hasMultipleParticipants={this.props.hasMultipleParticipants}
                        onStepComplete={this.navigateToNextStep}
                    />
                )}
                {currentStep === Steps.IOUConfirm && (
                    <IOUConfirmPage
                        onConfirm={() => console.debug('create IOU report')}
                        participants={[]}
                        iouAmount={42}
                    />
                )}
            </>
        );
    }
}

IOUModal.propTypes = propTypes;
IOUModal.defaultProps = defaultProps;
IOUModal.displayName = 'IOUModal';

export default IOUModal;
