import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import * as BugReportActions from '../../libs/actions/BugReport';
import getSystemDetails from '../../libs/actions/BugReport/getSystemDetails';
import ONYXKEYS from '../../ONYXKEYS';
import ConfirmModal from '../ConfirmModal';
import Icon from '../Icon';
import * as Illustrations from '../Icon/Illustrations';
import styles from '../../styles/styles';
import withNavigation from '../withNavigation';
import shakeEventTrigger from './shakeEventTrigger';

const propTypes = {
    /** prop to set shortcuts modal visibility */
    isBugReportModalOpen: PropTypes.bool,

    /** props to fetch translation functions */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isBugReportModalOpen: false,
};

class BugReportModal extends React.Component {
    componentDidMount() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.BUG_REPORT_MODAL;
        this.unsubscribeShortcutModal = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, this.showBugReportModal, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
        this.unsubscribeShakeEvent = shakeEventTrigger(this.showBugReportModal);
        this.submitAndClose = this.submitAndClose.bind(this);
    }

    componentWillUnmount() {
        if (!this.unsubscribeShortcutModal) {
            return;
        }
        this.unsubscribeShortcutModal();
    }

    showBugReportModal() {
        BugReportActions.showBugReportModal();
    }

    submitAndClose() {
        const systemDetails = getSystemDetails(this.props.navigation);
        BugReportActions.submitBugReport(systemDetails);
        BugReportActions.hideBugReportModal();
    }

    close() {
        BugReportActions.hideBugReportModal();
    }

    render() {
        return (
            <ConfirmModal
                title={this.props.translate('bugReportModal.title')}
                isVisible={this.props.isBugReportModalOpen}
                onConfirm={this.submitAndClose}
                onCancel={this.close}
                prompt={(
                    <View style={[styles.flex1, styles.alignItemsCenter]}>
                        <Icon
                            src={Illustrations.Bug}
                            width={228}
                            height={236}
                            fill="#0180FF"
                        />
                    </View>
                )}
                confirmText="Report Bug"
                cancelText={this.props.translate('common.cancel')}
            />
        );
    }
}

BugReportModal.propTypes = propTypes;
BugReportModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNavigation,
    withOnyx({
        isBugReportModalOpen: {key: ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN},
    }),
)(BugReportModal);
