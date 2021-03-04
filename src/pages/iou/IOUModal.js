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

    // IOU modal data
    iouData: PropTypes.shape({
        isLoadingCurrency: PropTypes.bool.isRequired,
        isLoadingParticipants: PropTypes.bool.isRequired,
        createReportInProgress: PropTypes.bool.isRequired,
    }),
};

const StepType = {
    IOUAmount: 'IOUAmount',
    IOUParticipants: 'IOUParticipants',
    IOUConfirm: 'IOUConfirm',
};

const defaultProps = {
    currentURL: '',
    iouData: {
        isLoadingCurrency: true,
        isLoadingParticipants: true,
        createReportInProgress: false,
    },
};

class IOUModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            steps: [StepType.IOUAmount, StepType.IOUParticipants, StepType.IOUConfirm],
            currentStepIndex: 0,
            hasMultipleParticipants: this.props.currentURL === ROUTES.IOU_BILL_SPLIT,
        };

        this.getTitleForStep = this.getTitleForStep.bind(this);
        this.navigateToPreviousStep = this.navigateToPreviousStep.bind(this);
        this.navigateToNextStep = this.navigateToNextStep.bind(this);
    }

    componentDidMount() {
        getPreferredCurrency();
    }

    /**
     * Returns the title for the currently selected page
     *
     * @return {String}
     */
    getTitleForStep() {
        switch (this.state.steps[this.state.currentStepIndex]) {
            case StepType.IOUAmount:
                return 'Amount';
            case StepType.IOUParticipants:
                return 'Participants';
            case StepType.IOUConfirm:
                return 'Confirm';
            default:
                return '';
        }
    }

    /**
     * Navigate to the next IOU step
     */
    navigateToPreviousStep() {
        this.setState(prevState => ({currentStepIndex: prevState.currentStepIndex - 1}));
    }

    /**
     * Navigate to the previous IOU step
     */
    navigateToNextStep() {
        this.setState(prevState => ({currentStepIndex: prevState.currentStepIndex + 1}));
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
                                onPress={() => this.navigateToPreviousStep()}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={BackArrow} />
                            </TouchableOpacity>
                        )}
                        <Header title={this.getTitleForStep()} />
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
                {this.state.steps[this.state.currentStepIndex] === StepType.IOUAmount
                && (
                    <IOUAmountPage
                        onStepComplete={() => this.navigateToNextStep()}
                        isLoading={this.props.iouData.isLoadingCurrency}
                    />
                )}
                {this.state.steps[this.state.currentStepIndex] === StepType.IOUParticipants
                && (
                    <IOUParticipantsPage
                        onStepComplete={() => this.navigateToNextStep()}
                        isLoading={this.props.iouData.isLoadingParticipants}
                        hasMultipleParticipants={this.state.hasMultipleParticipants}
                    />
                )}
                {this.state.steps[this.state.currentStepIndex] === StepType.IOUConfirm
                && (
                    <IOUConfirmPage
                        onConfirm={() => console.debug('create IOU report')}
                        isLoading={this.props.iouData.createReportInProgress}
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
    iouData: {
        key: ONYXKEYS.IOU,
    },
})(IOUModal);
