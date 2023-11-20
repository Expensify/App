import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import _ from 'underscore';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import DomUtils from '@libs/DomUtils';
import {getGroupChatName} from '@libs/GroupChatUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportUtils from '@libs/ReportUtils';
import * as ContextMenuActions from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as optionRowStyles from '@styles/optionRowStyles';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The ID of the report that the option is for */
    reportID: PropTypes.string.isRequired,

    /** Whether this option is currently in focus so we can modify its style */
    isFocused: PropTypes.bool,

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow: PropTypes.func,

    /** Toggle between compact and default view */
    viewMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The item that should be rendered */
    // eslint-disable-next-line react/forbid-prop-types
    optionItem: PropTypes.object,
};

const defaultProps = {
    hoverStyle: undefined,
    viewMode: 'default',
    onSelectRow: () => {},
    style: null,
    optionItem: null,
    isFocused: false,
    betas: [],
};

function OptionRowLHN(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef(null);
    const isFocusedRef = useRef(true);
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();

    const optionItem = props.optionItem;
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);

    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
            };
        }, []),
    );

    if (!optionItem) {
        return null;
    }

    const isHidden = optionItem.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    if (isHidden && !props.isFocused && !optionItem.isPinned) {
        return null;
    }

    const textStyle = props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = optionItem.isUnread ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles([styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, ...textUnreadStyle], props.style);
    const alternateTextStyle = StyleUtils.combineStyles(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2]
            : [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting],
        props.style,
    );
    const contentContainerStyles =
        props.viewMode === CONST.OPTION_MODE.COMPACT ? [styles.flex1, styles.flexRow, styles.overflowHidden, optionRowStyles.compactContentContainerStyles] : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );
    const hoveredBackgroundColor =
        (props.hoverStyle || styles.sidebarLinkHover) && (props.hoverStyle || styles.sidebarLinkHover).backgroundColor
            ? (props.hoverStyle || styles.sidebarLinkHover).backgroundColor
            : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const hasBrickError = optionItem.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const defaultSubscriptSize = optionItem.isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const shouldShowGreenDotIndicator = !hasBrickError && ReportUtils.requiresAttentionFromCurrentUser(optionItem, optionItem.parentReportAction);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = (event) => {
        if (!isFocusedRef.current && isSmallScreenWidth) {
            return;
        }
        setIsContextMenuActive(true);
        ReportActionContextMenu.showContextMenu(
            ContextMenuActions.CONTEXT_MENU_TYPES.REPORT,
            event,
            '',
            popoverAnchor,
            props.reportID,
            '0',
            props.reportID,
            '',
            () => {},
            () => setIsContextMenuActive(false),
            false,
            false,
            optionItem.isPinned,
            optionItem.isUnread,
        );
    };

    const emojiCode = lodashGet(optionItem, 'status.emojiCode', '');
    const statusText = lodashGet(optionItem, 'status.text', '');
    const statusClearAfterDate = lodashGet(optionItem, 'status.clearAfter', '');
    const formattedDate = DateUtils.getStatusUntilDate(statusClearAfterDate);
    const statusContent = formattedDate ? `${statusText} (${formattedDate})` : statusText;
    const isStatusVisible = Permissions.canUseCustomStatus(props.betas) && !!emojiCode && ReportUtils.isOneOnOneChat(ReportUtils.getReport(optionItem.reportID));

    const isGroupChat =
        optionItem.type === CONST.REPORT.TYPE.CHAT && _.isEmpty(optionItem.chatType) && !optionItem.isThread && lodashGet(optionItem, 'displayNamesWithTooltips.length', 0) > 2;
    const fullTitle = isGroupChat ? getGroupChatName(ReportUtils.getReport(optionItem.reportID)) : optionItem.text;

    return (
        <OfflineWithFeedback
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <Hoverable>
                {(hovered) => (
                    <PressableWithSecondaryInteraction
                        ref={popoverAnchor}
                        onPress={(e) => {
                            if (e) {
                                e.preventDefault();
                            }
                            // Enable Composer to focus on clicking the same chat after opening the context menu.
                            ReportActionComposeFocusManager.focus();
                            props.onSelectRow(optionItem, popoverAnchor);
                        }}
                        onMouseDown={(e) => {
                            // Allow composer blur on right click
                            if (!e) {
                                return;
                            }

                            // Prevent composer blur on left click
                            e.preventDefault();
                        }}
                        testID={optionItem.reportID}
                        onSecondaryInteraction={(e) => {
                            showPopover(e);
                            // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                            if (DomUtils.getActiveElement()) {
                                DomUtils.getActiveElement().blur();
                            }
                        }}
                        withoutFocusOnSecondaryInteraction
                        activeOpacity={0.8}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            styles.sidebarLinkInner,
                            StyleUtils.getBackgroundColorStyle(theme.sidebar),
                            props.isFocused ? styles.sidebarLinkActive : null,
                            (hovered || isContextMenuActive) && !props.isFocused ? props.hoverStyle || styles.sidebarLinkHover : null,
                        ]}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.navigatesToChat')}
                        needsOffscreenAlphaCompositing={props.optionItem.icons.length >= 2}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {!_.isEmpty(optionItem.icons) &&
                                    (optionItem.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            backgroundColor={props.isFocused ? theme.activeComponentBG : theme.sidebar}
                                            mainAvatar={optionItem.icons[0]}
                                            secondaryAvatar={optionItem.icons[1]}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : defaultSubscriptSize}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={optionItem.icons}
                                            isFocusMode={props.viewMode === CONST.OPTION_MODE.COMPACT}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                                hovered && !props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                            ]}
                                            shouldShowTooltip={OptionsListUtils.shouldOptionShowTooltip(optionItem)}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                        <DisplayNames
                                            accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                                            fullTitle={fullTitle}
                                            displayNamesWithTooltips={optionItem.displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={displayNameStyle}
                                            shouldUseFullTitle={
                                                optionItem.isChatRoom || optionItem.isPolicyExpenseChat || optionItem.isTaskReport || optionItem.isThread || optionItem.isMoneyRequestReport
                                            }
                                        />
                                        {isStatusVisible && (
                                            <Tooltip
                                                text={statusContent}
                                                shiftVertical={-4}
                                            >
                                                <Text style={styles.ml1}>{emojiCode}</Text>
                                            </Tooltip>
                                        )}
                                    </View>
                                    {optionItem.alternateText ? (
                                        <Text
                                            style={alternateTextStyle}
                                            numberOfLines={1}
                                            accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}
                                        >
                                            {optionItem.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                                {optionItem.descriptiveText ? (
                                    <View style={[styles.flexWrap]}>
                                        <Text style={[styles.textLabel]}>{optionItem.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {hasBrickError && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={theme.danger}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessible={false}
                        >
                            {shouldShowGreenDotIndicator && (
                                <View style={styles.ml2}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={theme.success}
                                    />
                                </View>
                            )}
                            {optionItem.hasDraftComment && optionItem.isAllowedToComment && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon src={Expensicons.Pencil} />
                                </View>
                            )}
                            {!shouldShowGreenDotIndicator && optionItem.isPinned && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.chatPinned')}
                                >
                                    <Icon src={Expensicons.Pin} />
                                </View>
                            )}
                        </View>
                    </PressableWithSecondaryInteraction>
                )}
            </Hoverable>
        </OfflineWithFeedback>
    );
}

OptionRowLHN.propTypes = propTypes;
OptionRowLHN.defaultProps = defaultProps;
OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);

export {propTypes, defaultProps};
