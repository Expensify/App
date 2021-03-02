import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import Modal from './Modal';
import {redirectToLastReport} from '../libs/actions/App';

const matchType = PropTypes.shape({
    // Current path of navigation
    path: PropTypes.string,
});

/**
 * Right-docked modal view showing a user's settings.
 */
const propTypes = {
    // Any children to display
    children: PropTypes.node.isRequired,

    // Route constant to show modal
    route: PropTypes.string.isRequired,

    // Router details
    match: matchType.isRequired,
};

const RightDockedModal = memo(({
    route, children, match,
}) => (
    <Modal
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        onClose={redirectToLastReport}
        isVisible={match.path === route}
        backgroundColor={themeColors.componentBG}
    >
        {children}
    </Modal>
));

RightDockedModal.propTypes = propTypes;
RightDockedModal.displayName = 'RightDockedModal';

export default withRouter(RightDockedModal);
