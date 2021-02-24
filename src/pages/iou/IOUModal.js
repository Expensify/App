import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import Modal from '../../components/Modal';
import {redirectToLastReport} from '../../libs/actions/App';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    // Any children to display
    children: PropTypes.node.isRequired,

    // Route constant to show modal
    route: PropTypes.string,

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,
};

const defaultProps = {
    route: '',
    currentURL: '',
};

const IOUModal = memo(({
    route, children, currentURL,
}) => (
    <Modal
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        onClose={redirectToLastReport}
        isVisible={currentURL === route}
        backgroundColor={themeColors.componentBG}
    >
        {children}
    </Modal>
));

IOUModal.propTypes = propTypes;
IOUModal.defaultProps = defaultProps;
IOUModal.displayName = 'IOUModal';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    currentURL: {
        key: ONYXKEYS.CURRENT_URL,
    },
})(IOUModal);
