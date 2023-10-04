import React, {useRef, useMemo, useState, memo} from 'react';
import {InteractionManager, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
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
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import useArrowKeyFocusManager from '../../../../hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '../../../../hooks/useKeyboardShortcut';

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
    const menuItemRefs = useRef({});
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini, props.isSmallScreenWidth);

    const reportAction = useMemo(() => {
        if (_.isEmpty(props.reportActions) || props.reportActionID === '0') {
            return {};
        }
        return props.reportActions[props.reportActionID] || {};
    }, [props.reportActions, props.reportActionID]);

    const shouldShowFilter = (contextAction) =>
        contextAction.shouldShow(props.type, reportAction, props.isArchivedRoom, props.betas, props.anchor, props.isChronosReport, props.reportID, props.isPinnedChat, props.isUnreadChat);

    const shouldEnableArrowNavigation = !props.isMini && (props.isVisible || shouldKeepOpen);
    const filteredContextMenuActions = _.filter(ContextMenuActions, shouldShowFilter);

    // Context menu actions that are not rendered as menu items are excluded from arrow navigation
    const nonMenuItemActionIndexes = _.map(filteredContextMenuActions, (contextAction, index) => (_.isFunction(contextAction.renderContent) ? index : undefined));
    const disabledIndexes = _.filter(nonMenuItemActionIndexes, (index) => !_.isUndefined(index));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes,
        maxIndex: filteredContextMenuActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

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

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        (event) => {
            if (!menuItemRefs.current[focusedIndex]) {
                return;
            }

            // Ensures the event does not cause side-effects beyond the context menu, e.g. when an outside element is focused
            if (event) {
                event.stopPropagation();
            }

            menuItemRefs.current[focusedIndex].triggerPressAndUpdateSuccess();
            setFocusedIndex(-1);
        },
        {isActive: shouldEnableArrowNavigation},
    );

    return (
        (props.isVisible || shouldKeepOpen) && (
            <View
                ref={props.contentRef}
                style={wrapperStyle}
            >
                {_.map(filteredContextMenuActions, (contextAction, index) => {
                    const closePopup = !props.isMini;
                    const payload = {
                        reportAction,
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
                            ref={(ref) => {
                                menuItemRefs.current[index] = ref;
                            }}
                            icon={contextAction.icon}
                            text={props.translate(contextAction.textTranslateKey, {action: reportAction})}
                            successIcon={contextAction.successIcon}
                            successText={contextAction.successTextTranslateKey ? props.translate(contextAction.successTextTranslateKey) : undefined}
                            isMini={props.isMini}
                            key={contextAction.textTranslateKey}
                            onPress={() => interceptAnonymousUser(() => contextAction.onPress(closePopup, payload), contextAction.isAnonymousAction)}
                            description={contextAction.getDescription(props.selection, props.isSmallScreenWidth)}
                            isAnonymousAction={contextAction.isAnonymousAction}
                            isFocused={focusedIndex === index}
                        />
                    );
                })}
            </View>
        )
    );
}

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withBetas(),
    withWindowDimensions,
    withOnyx({
        reportActions: {
            key: ({originalReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            canEvict: false,
        },
    }),
)(
    memo(BaseReportActionContextMenu, (prevProps, nextProps) => {
        const prevReportAction = lodashGet(prevProps.reportActions, prevProps.reportActionID, '');
        const nextReportAction = lodashGet(nextProps.reportActions, nextProps.reportActionID, '');

        // We only want to re-render when the report action that is attached to is changed
        if (prevReportAction !== nextReportAction) {
            return false;
        }
        return _.isEqual(_.omit(prevProps, 'reportActions'), _.omit(nextProps, 'reportActions'));
    }),
);
