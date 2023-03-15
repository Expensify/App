import React from 'react';
import PropTypes from 'prop-types';
import DevMenu from 'react-native-dev-menu';
import RNShake from 'react-native-shake';
import Onyx from 'react-native-onyx';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import Text from './Text';
import Modal from './Modal';
import CONST from '../CONST';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import * as BugReportShortcutsActions from '../libs/actions/BugReportShortcuts';
import * as ModalActions from '../libs/actions/Modal';
import ONYXKEYS from '../ONYXKEYS';
import ConfirmModal from './ConfirmModal';
import * as BugReport from '../libs/actions/BugReport';
import withNavigation from './withNavigation';
import withNavigationFocus from './withNavigationFocus';

const propTypes = {
    /** prop to set shortcuts modal visibility */
    isBugReportModalOpen: PropTypes.bool,

    /** prop to fetch screen width */
    ...windowDimensionsPropTypes,

    /** props to fetch translation functions */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isBugReportModalOpen: false,
};

class BugReportConfirmationModal extends React.Component {
    componentDidMount() {

        if (!__DEV__) {
            // For Developers
            DevMenu.addItem('Report bug', () => {
                Onyx.merge(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, true);
            });
        } else {
            // For the rest of the world
            RNShake.addListener(() => {
                Onyx.merge(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, true);
            });
        }
    }

    componentWillUnmount() {
        if (!this.unsubscribeShortcutModal) {
            return;
        }
        this.unsubscribeShortcutModal();
        RNShake.removeAllListeners();
    }

    submitAndClose() {
        // eslint-disable-next-line no-console
        console.log('success');
        BugReportShortcutsActions.hideKeyboardShortcutModal();
        BugReport.send(BugReport.getSystemDetails(this.props.navigation));
    }

    close() {
        // eslint-disable-next-line no-console
        console.log('nvm');
        BugReportShortcutsActions.hideKeyboardShortcutModal();
    }

    render() {
        return (
            <>
                <ConfirmModal
                    title="You seem frustrated..."
                    isVisible={this.props.isBugReportModalOpen}
                    onConfirm={this.submitAndClose}
                    onCancel={this.close}
                    prompt="Would you like to report a bug?"
                    confirmText="Report Bug"
                    cancelText={this.props.translate('common.cancel')}
                />
            </>
        );
    }
}

BugReportConfirmationModal.propTypes = propTypes;
BugReportConfirmationModal.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        isBugReportModalOpen: {key: ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN},
    }),
)(BugReportConfirmationModal);
