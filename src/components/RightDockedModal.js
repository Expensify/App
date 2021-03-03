import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import Modal from './Modal';
import {redirectToLastReport} from '../libs/actions/App';
import {modalHide} from '../libs/actions/Modal';

/**
 * Right-docked modal view showing a user's settings.
 */
const propTypes = {
    // Any children to display
    children: PropTypes.node.isRequired,

    // Route constant to show modal
    route: PropTypes.string,

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,

    isModalShown: PropTypes.bool,

    modalType: PropTypes.string,
};

const defaultProps = {
    route: '',
    currentURL: '',
    isModalShown: false,
    modalType: '',
};

class RightDockedModal extends PureComponent {
    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.modalHandler = this.modalHandler.bind(this);

        this.state = {
            isVisible: false,
        };
    }

    componentDidMount() {
        this.modalHandler();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isModalShown !== this.props.isModalShown || prevProps.currentURL !== this.props.currentURL) {
            this.modalHandler();
        }
    }

    onClose() {
        const {isModalShown} = this.props;
        if (isModalShown) {
            modalHide();
        }
        redirectToLastReport();
    }

    modalHandler() {
        const {
            isModalShown, modalType, route, currentURL,
        } = this.props;
        if (route === modalType) {
            this.setState({isVisible: isModalShown});
        } else {
            this.setState({isVisible: route === currentURL});
        }
    }


    render() {
        const {isVisible} = this.state;
        return (
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                onClose={this.onClose}
                isVisible={isVisible}
                backgroundColor={themeColors.componentBG}
            >
                {this.props.children}
            </Modal>
        );
    }
}

RightDockedModal.propTypes = propTypes;
RightDockedModal.defaultProps = defaultProps;
RightDockedModal.displayName = 'RightDockedModal';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    currentURL: {
        key: ONYXKEYS.CURRENT_URL,
    },
    modalType: {
        key: ONYXKEYS.MODAL.MODAL_TYPE,
    },
    isModalShown: {
        key: ONYXKEYS.MODAL.IS_MODAL_SHOWN,
    },
})(RightDockedModal);
