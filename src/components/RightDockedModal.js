import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import Modal from './Modal';
import {redirectToLastReport} from '../libs/actions/App';

/**
 * Right-docked modal view showing a user's settings.
 */
const propTypes = {
    // Any children to display
    children: PropTypes.node.isRequired,

    // Route constant to show modal
    routes: PropTypes.arrayOf(PropTypes.string),

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,
};

const defaultProps = {
    routes: [],
    currentURL: '',
};

const RightDockedModal = memo(({
    routes, children, currentURL,
}) => (
    <Modal
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        onClose={redirectToLastReport}
        isVisible={routes.includes(currentURL)}
        backgroundColor={themeColors.componentBG}
    >
        {children}
    </Modal>
));

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
})(RightDockedModal);
