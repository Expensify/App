import React, {Component} from 'react';
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
import HeaderGap from '../../components/HeaderGap';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';

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
            step: StepType.IOUConfirm,
        };

        this.getTitleForStep = this.getTitleForStep;
    }

    /**
     * Returns the title for the currently selected page
     *
     * @return {String}
     */
    getTitleForStep() {
        console.debug('StepType', this.state.step);
        switch (this.state.step) {
            case StepType.IOUAmount: 
                return 'Amount'
            case StepType.IOUParticipants: 
                return 'Participants'
            case StepType.IOUConfirm: 
                return 'Confirm'
            default:
                return ''
        }
    }

    render() {
        return (
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                onClose={redirectToLastReport}
                isVisible={this.props.currentURL === this.props.route}
                backgroundColor={themeColors.componentBG}
            >
                <HeaderGap />
                <HeaderWithCloseButton
                    title={this.getTitleForStep()}
                    onCloseButtonPress={redirectToLastReport}
                />
                {this.state.step === StepType.IOUAmount && <IOUAmountPage />}
                {this.state.step === StepType.IOUParticipants && <IOUParticipantsPage />}
                {this.state.step === StepType.IOUConfirm && <IOUConfirmPage />}
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
