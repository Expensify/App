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
    route: PropTypes.string,

    /* Onyx Props */
    // Url currently in view
    currentURL: PropTypes.string,
};

const defaultProps = {
    route: '',
    currentURL: '',
};

const RightDockedModal = memo(({
    route, children, currentURL,
}) => {
    // Using includes allows for subroutes to work.
    // All /settings/:route subroutes would go to the SettingsPage and
    // that page will render the right components for the subroute.
    const isVisible = currentURL.includes(route);
    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onClose={redirectToLastReport}
            isVisible={isVisible}
            backgroundColor={themeColors.componentBG}
        >
            {children}
        </Modal>
    );
});

RightDockedModal.propTypes = propTypes;
RightDockedModal.defaultProps = defaultProps;
RightDockedModal.displayName = 'RightDockedModal';

export default withOnyx({
    currentURL: {
        key: ONYXKEYS.CURRENT_URL,
    },
})(RightDockedModal);
