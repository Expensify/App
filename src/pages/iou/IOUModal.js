import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import {redirectToLastReport} from '../../libs/actions/App';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import getPreferredCurrency from '../../libs/actions/IOU';
import {Close, BackArrow} from '../../components/Icon/Expensicons';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,
};

const Steps = {
    IOUAmount: 'Amount',
    IOUParticipants: 'Participants',
    IOUConfirm: 'Confirm',
};

const defaultProps = {
    currentURL: '',
};

class IOUModal extends Component {
    constructor(props) {
        super(props);

        this.navigateToPreviousStep = this.navigateToPreviousStep.bind(this);
        this.navigateToNextStep = this.navigateToNextStep.bind(this);

        this.state = {
            steps: [Steps.IOUAmount, Steps.IOUParticipants, Steps.IOUConfirm],
            currentStepIndex: 0,
            currentStepTitle: Steps.IOUAmount,
            hasMultipleParticipants: this.props.currentURL === ROUTES.IOU_BILL_SPLIT,
        };
    }

    componentDidMount() {
        getPreferredCurrency();
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
            currentStepTitle: prevState.steps[prevState.currentStepIndex - 1] || '',
        }));
    }

    /**
     * Navigate to the previous IOU step if possible
     */
    navigateToNextStep() {
        if (this.state.currentStepIndex >= this.state.steps.length - 1) {
            return;
        }
        this.setState(prevState => ({
            currentStepIndex: prevState.currentStepIndex + 1,
            currentStepTitle: prevState.steps[prevState.currentStepIndex + 1] || '',
        }));
    }

    render() {
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
                        <Header title={this.state.currentStepTitle} />
                        <View style={[styles.reportOptions, styles.flexRow]}>
                            <TouchableOpacity
                                onPress={redirectToLastReport}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={Close} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {this.state.steps[this.state.currentStepIndex] === Steps.IOUAmount
                && (
                    <IOUAmountPage
                        onStepComplete={() => this.navigateToNextStep()}
                    />
                )}
                {this.state.steps[this.state.currentStepIndex] === Steps.IOUParticipants
                && (
                    <IOUParticipantsPage
                        onStepComplete={() => this.navigateToNextStep()}
                        hasMultipleParticipants={this.state.hasMultipleParticipants}
                    />
                )}
                {this.state.steps[this.state.currentStepIndex] === Steps.IOUConfirm
                && (
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

export default withOnyx({
    currentURL: {
        key: ONYXKEYS.CURRENT_URL,
    },
})(IOUModal);
