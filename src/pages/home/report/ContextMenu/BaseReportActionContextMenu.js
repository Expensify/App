import React, {useState} from 'react';
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
function BaseReportActionContextMenu(props) {
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini, props.isSmallScreenWidth);
    const shouldShowFilter = (contextAction) =>
        contextAction.shouldShow(
            props.type,
            props.reportAction,
            props.isArchivedRoom,
            props.betas,
            props.anchor,
            props.isChronosReport,
            props.reportID,
            props.isPinnedChat,
            props.isUnreadChat,
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
        (props.isVisible || shouldKeepOpen) && (
            <View
                ref={props.contentRef}
                style={wrapperStyle}
            >
                {_.map(_.filter(ContextMenuActions, shouldShowFilter), (contextAction) => {
                    const closePopup = !props.isMini;
                    const payload = {
                        reportAction: props.reportAction,
                        reportID: props.reportID,
                        draftMessage: props.draftMessage,
                        selection: props.selection,
                        close: () => setShouldKeepOpen(false),
                        openContextMenu: () => setShouldKeepOpen(true),
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
                            text={props.translate(contextAction.textTranslateKey, {action: props.reportAction})}
                            successIcon={contextAction.successIcon}
                            successText={contextAction.successTextTranslateKey ? props.translate(contextAction.successTextTranslateKey) : undefined}
                            isMini={props.isMini}
                            key={contextAction.textTranslateKey}
                            onPress={() => interceptAnonymousUser(() => contextAction.onPress(closePopup, payload), contextAction.isAnonymousAction)}
                            description={contextAction.getDescription(props.selection, props.isSmallScreenWidth)}
                            isAnonymousAction={contextAction.isAnonymousAction}
                        />
                    );
                })}
            </View>
        )
    );
}

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;

export default compose(withLocalize, withBetas(), withWindowDimensions)(BaseReportActionContextMenu);
