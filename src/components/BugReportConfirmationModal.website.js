import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
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
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';

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
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.BUG_REPORT_MODAL;
        this.unsubscribeShortcutModal = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            ModalActions.close();
            BugReportShortcutsActions.showKeyboardShortcutModal();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
        this.submitAndClose = this.submitAndClose.bind(this);
    }

    componentWillUnmount() {
        if (!this.unsubscribeShortcutModal) {
            return;
        }
        this.unsubscribeShortcutModal();
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
                    prompt={(
                        <Icon
                            src={Illustrations.Bug}
                            width={228}
                            height={236}
                            fill="#0180FF"
                            style={[
                                {width: 200, height: 200},
                            ]}
                        />
                    )}
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
