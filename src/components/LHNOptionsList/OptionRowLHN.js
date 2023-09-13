import _ from 'underscore';
import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import * as optionRowStyles from '../../styles/optionRowStyles';
import * as StyleUtils from '../../styles/StyleUtils';
import DateUtils from '../../libs/DateUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import MultipleAvatars from '../MultipleAvatars';
import Hoverable from '../Hoverable';
import DisplayNames from '../DisplayNames';
import colors from '../../styles/colors';
import Text from '../Text';
import SubscriptAvatar from '../SubscriptAvatar';
import CONST from '../../CONST';
import OfflineWithFeedback from '../OfflineWithFeedback';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../pages/home/report/ContextMenu/ContextMenuActions';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import useLocalize from '../../hooks/useLocalize';
import Permissions from '../../libs/Permissions';
import Tooltip from '../Tooltip';
import useTheme from '../../styles/themes/useTheme';
import useThemeStyles from '../../styles/useThemeStyles';

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
    const themeStyles = useThemeStyles;

    const hoverStyle = props.hoverStyle || themeStyles.sidebarLinkHover;

    const [isContextMenuActive, setIsContextMenuActive] = useState(false);
    const popoverAnchor = useRef(null);

    const {translate} = useLocalize();

    const optionItem = props.optionItem;

    if (!optionItem) {
        return null;
    }

    const isHidden = optionItem.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    if (isHidden && !props.isFocused && !optionItem.isPinned) {
        return null;
    }

    const textStyle = props.isFocused ? themeStyles.sidebarLinkActiveText : themeStyles.sidebarLinkText;
    const textUnreadStyle = optionItem.isUnread ? [textStyle, themeStyles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles([themeStyles.optionDisplayName, themeStyles.optionDisplayNameCompact, themeStyles.pre, ...textUnreadStyle], props.style);
    const alternateTextStyle = StyleUtils.combineStyles(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [textStyle, themeStyles.optionAlternateText, themeStyles.noWrap, themeStyles.textLabelSupporting, themeStyles.optionAlternateTextCompact, themeStyles.ml2]
            : [textStyle, themeStyles.optionAlternateText, themeStyles.noWrap, themeStyles.textLabelSupporting],
        props.style,
    );
    const contentContainerStyles =
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [themeStyles.flex1, themeStyles.flexRow, themeStyles.overflowHidden, optionRowStyles.compactContentContainerStyles]
            : [themeStyles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [themeStyles.chatLinkRowPressable, themeStyles.flexGrow1, themeStyles.optionItemAvatarNameWrapper, themeStyles.optionRowCompact, themeStyles.justifyContentCenter]
            : [themeStyles.chatLinkRowPressable, themeStyles.flexGrow1, themeStyles.optionItemAvatarNameWrapper, themeStyles.optionRow, themeStyles.justifyContentCenter],
    );
    const hoveredBackgroundColor = props.hoverStyle && props.hoverStyle.backgroundColor ? props.hoverStyle.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = themeStyles.sidebarLinkActive.backgroundColor;

    const hasBrickError = optionItem.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const defaultSubscriptSize = optionItem.isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const shouldShowGreenDotIndicator =
        !hasBrickError &&
        (optionItem.isUnreadWithMention ||
            ReportUtils.isWaitingForIOUActionFromCurrentUser(optionItem) ||
            (optionItem.isTaskReport && optionItem.isTaskAssignee && !optionItem.isCompletedTaskReport && !optionItem.isArchivedRoom));

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = (event) => {
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
    const isStatusVisible = Permissions.canUseCustomStatus(props.betas) && !!emojiCode && ReportUtils.isOneOnOneChat(optionItem);

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

                            props.onSelectRow(optionItem, popoverAnchor);
                        }}
                        onMouseDown={(e) => {
                            if (!e) {
                                return;
                            }

                            // Prevent losing Composer focus
                            e.preventDefault();
                        }}
                        onSecondaryInteraction={(e) => showPopover(e)}
                        withoutFocusOnSecondaryInteraction
                        activeOpacity={0.8}
                        style={[
                            themeStyles.flexRow,
                            themeStyles.alignItemsCenter,
                            themeStyles.justifyContentBetween,
                            themeStyles.sidebarLink,
                            themeStyles.sidebarLinkInner,
                            StyleUtils.getBackgroundColorStyle(theme.sidebar),
                            props.isFocused ? themeStyles.sidebarLinkActive : null,
                            (hovered || isContextMenuActive) && !props.isFocused ? hoverStyle : null,
                        ]}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.navigatesToChat')}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[themeStyles.flexRow, themeStyles.alignItemsCenter]}>
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
                                    <View style={[themeStyles.flexRow, themeStyles.alignItemsCenter, themeStyles.mw100, themeStyles.overflowHidden]}>
                                        <DisplayNames
                                            accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                                            fullTitle={optionItem.text}
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
                                                <Text style={themeStyles.ml1}>{emojiCode}</Text>
                                            </Tooltip>
                                        )}
                                    </View>
                                    {optionItem.alternateText ? (
                                        <Text
                                            style={alternateTextStyle}
                                            numberOfLines={1}
                                            accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}
                                        >
                                            {optionItem.isLastMessageDeletedParentAction ? translate('parentReportAction.deletedMessage') : optionItem.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                                {optionItem.descriptiveText ? (
                                    <View style={[themeStyles.flexWrap]}>
                                        <Text style={[themeStyles.textLabel]}>{optionItem.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {hasBrickError && (
                                    <View style={[themeStyles.alignItemsCenter, themeStyles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={colors.red}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View
                            style={[themeStyles.flexRow, themeStyles.alignItemsCenter]}
                            accessible={false}
                        >
                            {shouldShowGreenDotIndicator && (
                                <View style={themeStyles.ml2}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={theme.success}
                                    />
                                </View>
                            )}
                            {optionItem.hasDraftComment && optionItem.isAllowedToComment && (
                                <View
                                    style={themeStyles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon src={Expensicons.Pencil} />
                                </View>
                            )}
                            {!shouldShowGreenDotIndicator && optionItem.isPinned && (
                                <View
                                    style={themeStyles.ml2}
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
