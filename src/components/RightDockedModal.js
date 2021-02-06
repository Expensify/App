import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import ModalWithHeader from './ModalWithHeader';
import {redirect} from '../libs/actions/App';
import ROUTES from '../ROUTES';

/**
 * Right-docked modal view showing a user's settings.
 */
const propTypes = {
    // Title of the Modal
    title: PropTypes.string.isRequired,

    // Any children to display
    children: PropTypes.node.isRequired,

    // Route constant to show modal
    route: PropTypes.string,

    /* Onyx Props */
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,

    // Url currently in view
    currentURL: PropTypes.string,
};

const defaultProps = {
    route: '',
    currentlyViewedReportID: '',
    currentURL: '',
};

const RightDockedModal = memo(({
    currentlyViewedReportID, route, title, children, currentURL,
}) => (
    <ModalWithHeader
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        onClose={() => redirect(_.isEmpty(currentlyViewedReportID)
            ? ROUTES.HOME
            : ROUTES.getReportRoute(currentlyViewedReportID))}
        isVisible={currentURL === route}
        title={title}
        backgroundColor={themeColors.componentBG}
    >
        {children}
    </ModalWithHeader>
));

RightDockedModal.propTypes = propTypes;
RightDockedModal.defaultProps = defaultProps;
RightDockedModal.displayName = 'RightDockedModal';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
    currentURL: {
        key: ONYXKEYS.CURRENT_URL,
    },
})(RightDockedModal);
