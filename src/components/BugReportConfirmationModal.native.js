import React from 'react';
import PropTypes from 'prop-types';
import DevMenu from 'react-native-dev-menu';
import RNShake from 'react-native-shake';
import Onyx, {withOnyx} from 'react-native-onyx';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as BugReportShortcutsActions from '../libs/actions/BugReportShortcuts';
import ONYXKEYS from '../ONYXKEYS';
import ConfirmModal from './ConfirmModal';
import * as BugReport from '../libs/actions/BugReport';

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
    subscription;

    constructor(props) {
        super(props);
        this.submitAndClose = this.submitAndClose.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount() {
        const handleTrigger = () => {
            Onyx.merge(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, true);
        };

        if (__DEV__) {
            DevMenu.addItem('Report bug', handleTrigger);
        } else {
            this.subscription = RNShake.addListener(handleTrigger);
        }
    }

    componentWillUnmount() {
        if (!this.unsubscribeShortcutModal) {
            return;
        }
        this.unsubscribeShortcutModal();
        this.subscription.remove();
    }

    submitAndClose() {
        this.close();
        BugReport.send(BugReport.getSystemDetails(this.props.navigation));
    }

    close() {
        BugReportShortcutsActions.hideKeyboardShortcutModal();
    }

    render() {
        return (
            <ConfirmModal
                title="You seem frustrated..."
                isVisible={this.props.isBugReportModalOpen}
                onConfirm={this.submitAndClose}
                onCancel={this.close}
                prompt="Would you like to report a bug?"
                confirmText="Report Bug"
                cancelText={this.props.translate('common.cancel')}
            />
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
