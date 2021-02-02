import React from 'react';
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

    // Page to be shown on the Modal
    Page: PropTypes.func.isRequired,

    // Is the Modal visible or not?
    isVisible: PropTypes.bool,

    /* Onyx Props */
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    isVisible: false,
    currentlyViewedReportID: '',
};

const RightDockedModal = ({
    currentlyViewedReportID, isVisible, title, Page,
}) => (
    <ModalWithHeader
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        onClose={() => redirect(_.isEmpty(currentlyViewedReportID)
            ? ROUTES.HOME
            : ROUTES.getReportRoute(currentlyViewedReportID))}
        isVisible={isVisible}
        title={title}
        backgroundColor={themeColors.componentBG}
    >
        <Page />
    </ModalWithHeader>
);

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
})(RightDockedModal);
