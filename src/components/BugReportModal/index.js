import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import * as BugReportActions from '../../libs/actions/BugReport';
import ONYXKEYS from '../../ONYXKEYS';
import ConfirmModal from '../ConfirmModal';
import Icon from '../Icon';
import * as Illustrations from '../Icon/Illustrations';

const propTypes = {
    /** prop to set shortcuts modal visibility */
    isBugReportModalOpen: PropTypes.bool,

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
            BugReportActions.showBugReportModal();
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
        );
    }
}

BugReportConfirmationModal.propTypes = propTypes;
BugReportConfirmationModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        isBugReportModalOpen: {key: ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN},
    }),
)(BugReportConfirmationModal);
