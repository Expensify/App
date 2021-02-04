import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import SettingsPage from '../pages/SettingsPage';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import ModalWithHeader from './ModalWithHeader';
import ROUTES from '../ROUTES';
import Navigator from '../Navigator';

/**
 * Right-docked modal view showing a user's settings.
 */
const propTypes = {
    // Is the Settings Modal visible or not?
    isVisible: PropTypes.bool,

    /* Onyx Props */
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    isVisible: false,
    currentlyViewedReportID: '',
};

const SettingsModal = props => (
    <ModalWithHeader
        type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        isVisible={props.isVisible}
        title="Settings"
        backgroundColor={themeColors.componentBG}
        onClose={() => {
            if (_.isEmpty(props.currentlyViewedReportID)) {
                Navigator.navigate(ROUTES.ROOT);
            } else {
                Navigator.navigate(ROUTES.REPORT, {reportID: props.currentlyViewedReportID});
            }
        }}
    >
        <SettingsPage />
    </ModalWithHeader>
);

SettingsModal.propTypes = propTypes;
SettingsModal.defaultProps = defaultProps;
SettingsModal.displayName = 'SettingsModal';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(SettingsModal);
