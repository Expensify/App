import React from 'react';
import {InteractionManager, View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import ContextMenuItem from '../../../../components/ContextMenuItem';
import {propTypes as genericReportActionContextMenuPropTypes, defaultProps as GenericReportActionContextMenuDefaultProps} from './genericReportActionContextMenuPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ContextMenuActions, {CONTEXT_MENU_TYPES} from './ContextMenuActions';
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import {withBetas} from '../../../../components/OnyxProvider';
import * as Session from '../../../../libs/actions/Session';
import {hideContextMenu} from './ReportActionContextMenu';

const propTypes = {
    /** String representing the context menu type [LINK, REPORT_ACTION] which controls context menu choices  */
    type: PropTypes.string,

    /** Target node which is the target of ContentMenu */
    anchor: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),

    /** Flag to check if the chat participant is Chronos */
    isChronosReport: PropTypes.bool,

    /** Whether the provided report is an archived room */
    isArchivedRoom: PropTypes.bool,

    contentRef: PropTypes.oneOfType([PropTypes.node, PropTypes.object, PropTypes.func]),

    ...genericReportActionContextMenuPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    type: CONTEXT_MENU_TYPES.REPORT_ACTION,
    anchor: null,
    contentRef: null,
    isChronosReport: false,
    isArchivedRoom: false,
    ...GenericReportActionContextMenuDefaultProps,
};
class BaseReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini, this.props.isSmallScreenWidth);

        this.state = {
            shouldKeepOpen: false,
        };
    }

    render() {
        const shouldShowFilter = (contextAction) =>
            contextAction.shouldShow(
                this.props.type,
                this.props.reportAction,
                this.props.isArchivedRoom,
                this.props.betas,
                this.props.anchor,
                this.props.isChronosReport,
                this.props.reportID,
                this.props.isPinnedChat,
                this.props.isUnreadChat,
            );

        /**
         * Checks if user is anonymous. If true and the action doesn't accept for anonymous user, hides the context menu and
         * shows the sign in modal. Else, executes the callback.
         *
         * @param {Function} callback
         * @param {Boolean} isAnonymousAction
         */
        const interceptAnonymousUser = (callback, isAnonymousAction = false) => {
            if (Session.isAnonymousUser() && !isAnonymousAction) {
                hideContextMenu(false);

                InteractionManager.runAfterInteractions(() => {
                    Session.signOutAndRedirectToSignIn();
                });
            } else {
                callback();
            }
        };

        return (
            (this.props.isVisible || this.state.shouldKeepOpen) && (
                <View
                    ref={this.props.contentRef}
                    style={this.wrapperStyle}
                >
                    {_.map(_.filter(ContextMenuActions, shouldShowFilter), (contextAction) => {
                        const closePopup = !this.props.isMini;
                        const payload = {
                            reportAction: this.props.reportAction,
                            reportID: this.props.reportID,
                            draftMessage: this.props.draftMessage,
                            selection: this.props.selection,
                            close: () => this.setState({shouldKeepOpen: false}),
                            openContextMenu: () => this.setState({shouldKeepOpen: true}),
                            interceptAnonymousUser,
                        };

                        if (contextAction.renderContent) {
                            // make sure that renderContent isn't mixed with unsupported props
                            if (__DEV__ && (contextAction.text != null || contextAction.icon != null)) {
                                throw new Error('Dev error: renderContent() and text/icon cannot be used together.');
                            }

                            return contextAction.renderContent(closePopup, payload);
                        }

                        return (
                            <ContextMenuItem
                                icon={contextAction.icon}
                                text={this.props.translate(contextAction.textTranslateKey, {action: this.props.reportAction})}
                                successIcon={contextAction.successIcon}
                                successText={contextAction.successTextTranslateKey ? this.props.translate(contextAction.successTextTranslateKey) : undefined}
                                isMini={this.props.isMini}
                                key={contextAction.textTranslateKey}
                                onPress={() => interceptAnonymousUser(() => contextAction.onPress(closePopup, payload), contextAction.isAnonymousAction)}
                                description={contextAction.getDescription(this.props.selection, this.props.isSmallScreenWidth)}
                                autoReset={contextAction.autoReset}
                                isAnonymousAction={contextAction.isAnonymousAction}
                            />
                        );
                    })}
                </View>
            )
        );
    }
}

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;

export default compose(withLocalize, withBetas(), withWindowDimensions)(BaseReportActionContextMenu);
