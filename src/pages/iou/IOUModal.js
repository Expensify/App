import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Text from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import Modal from '../../components/Modal';
import {redirectToLastReport} from '../../libs/actions/App';
import Avatar from '../../components/Avatar';

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
    IOUCOnfirm: 'IOUCOnfirm',
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
        };
    }

    render() {
        return (
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                onClose={redirectToLastReport}
                isVisible={this.props.currentURL === this.props.route}
                backgroundColor={themeColors.componentBG}
            >
                {
                    this.state.step === StepType.IOUAmount ? <Avatar source={'https://http.cat/101'} /> : null
                }
                {
                    this.state.step === StepType.IOUParticipants ? <Avatar source={'https://http.cat/102'} /> : null
                }
                {
                    this.state.step === StepType.IOUCOnfirm ? <Avatar source={'https://http.cat/103'} /> : null
                }

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
