import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import Modal from '../../components/Modal';
import {redirectToLastReport} from '../../libs/actions/App';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import {Close, BackArrow} from '../../components/Icon/Expensicons';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    // Route constant to show modal
    route: PropTypes.string,

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,
};

const StepType = {
    IOUAmount: 'IOUAmount',
    IOUParticipants: 'IOUParticipants',
    IOUConfirm: 'IOUConfirm',
};

const defaultProps = {
    route: '',
    currentURL: '',
};

class IOUModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: StepType.IOUAmount,
            currentStepIndex: 0,
        };

        this.getTitleForStep = this.getTitleForStep;
        this.navigateToPreviousStep = this.navigateToPreviousStep;
        this.navigateToNextStep = this.navigateToNextStep;
    }

    /**
     * Returns the title for the currently selected page
     *
     * @return {String}
     */
    getTitleForStep() {
        // todo: switch back to StepType
        switch (this.state.currentStepIndex) {
            case 0: 
                return 'Amount'
            case 1: 
                return 'Participants'
            case 2: 
                return 'Confirm'
            default:
                return ''
        }
    }

    navigateToPreviousStep() {
        this.setState({currentStepIndex: this.state.currentStepIndex-1});
    }

    navigateToNextStep() {
        this.setState({currentStepIndex: this.state.currentStepIndex+1});
    }

    render() {
        return (
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                onClose={redirectToLastReport}
                isVisible={this.props.currentURL === this.props.route}
                backgroundColor={themeColors.componentBG}
            >
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
                        {this.state.currentStepIndex > 0 &&
                            <TouchableOpacity
                                onPress={() => this.navigateToPreviousStep()}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={BackArrow} />
                            </TouchableOpacity>
                        }
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
                {this.state.currentStepIndex === 0 && 
                    <IOUAmountPage
                        onStepComplete={() => this.navigateToNextStep()}
                    />}
                {this.state.currentStepIndex === 1 && 
                    <IOUParticipantsPage
                        onStepComplete={() => this.navigateToNextStep()}
                    />}
                {this.state.currentStepIndex === 2 && 
                    <IOUConfirmPage
                        onStepComplete={() => redirectToLastReport()}
                    />}
            </Modal>
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
