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
import withTheme, {withThemePropTypes} from '../withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from '../withThemeStyles';
import compose from '../../libs/compose';

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

    ...withThemePropTypes,
    ...withThemeStylesPropTypes,
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
    const hoverStyle = props.hoverStyle || props.themeStyles.sidebarLinkHover;

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

    const textStyle = props.isFocused ? props.themeStyles.sidebarLinkActiveText : props.themeStyles.sidebarLinkText;
    const textUnreadStyle = optionItem.isUnread ? [textStyle, props.themeStyles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles(
        [props.themeStyles.optionDisplayName, props.themeStyles.optionDisplayNameCompact, props.themeStyles.pre, ...textUnreadStyle],
        props.style,
    );
    const alternateTextStyle = StyleUtils.combineStyles(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [
                  textStyle,
                  props.themeStyles.optionAlternateText,
                  props.themeStyles.noWrap,
                  props.themeStyles.textLabelSupporting,
                  props.themeStyles.optionAlternateTextCompact,
                  props.themeStyles.ml2,
              ]
            : [textStyle, props.themeStyles.optionAlternateText, props.themeStyles.noWrap, props.themeStyles.textLabelSupporting],
        props.style,
    );
    const contentContainerStyles =
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [props.themeStyles.flex1, props.themeStyles.flexRow, props.themeStyles.overflowHidden, optionRowStyles.compactContentContainerStyles]
            : [props.themeStyles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [
                  props.themeStyles.chatLinkRowPressable,
                  props.themeStyles.flexGrow1,
                  props.themeStyles.optionItemAvatarNameWrapper,
                  props.themeStyles.optionRowCompact,
                  props.themeStyles.justifyContentCenter,
              ]
            : [
                  props.themeStyles.chatLinkRowPressable,
                  props.themeStyles.flexGrow1,
                  props.themeStyles.optionItemAvatarNameWrapper,
                  props.themeStyles.optionRow,
                  props.themeStyles.justifyContentCenter,
              ],
    );
    const hoveredBackgroundColor = props.hoverStyle && props.hoverStyle.backgroundColor ? props.hoverStyle.backgroundColor : props.theme.sidebar;
    const focusedBackgroundColor = props.themeStyles.sidebarLinkActive.backgroundColor;

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
                            props.themeStyles.flexRow,
                            props.themeStyles.alignItemsCenter,
                            props.themeStyles.justifyContentBetween,
                            props.themeStyles.sidebarLink,
                            props.themeStyles.sidebarLinkInner,
                            StyleUtils.getBackgroundColorStyle(props.theme.sidebar),
                            props.isFocused ? props.themeStyles.sidebarLinkActive : null,
                            (hovered || isContextMenuActive) && !props.isFocused ? hoverStyle : null,
                        ]}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.navigatesToChat')}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[props.themeStyles.flexRow, props.themeStyles.alignItemsCenter]}>
                                {!_.isEmpty(optionItem.icons) &&
                                    (optionItem.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            backgroundColor={props.isFocused ? props.theme.activeComponentBG : props.theme.sidebar}
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
                                                StyleUtils.getBackgroundAndBorderStyle(props.theme.sidebar),
                                                props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                                hovered && !props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                            ]}
                                            shouldShowTooltip={OptionsListUtils.shouldOptionShowTooltip(optionItem)}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <View style={[props.themeStyles.flexRow, props.themeStyles.alignItemsCenter, props.themeStyles.mw100, props.themeStyles.overflowHidden]}>
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
                                                <Text style={props.themeStyles.ml1}>{emojiCode}</Text>
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
                                    <View style={[props.themeStyles.flexWrap]}>
                                        <Text style={[props.themeStyles.textLabel]}>{optionItem.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {hasBrickError && (
                                    <View style={[props.themeStyles.alignItemsCenter, props.themeStyles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={colors.red}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View
                            style={[props.themeStyles.flexRow, props.themeStyles.alignItemsCenter]}
                            accessible={false}
                        >
                            {shouldShowGreenDotIndicator && (
                                <View style={props.themeStyles.ml2}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={props.theme.success}
                                    />
                                </View>
                            )}
                            {optionItem.hasDraftComment && optionItem.isAllowedToComment && (
                                <View
                                    style={props.themeStyles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon src={Expensicons.Pencil} />
                                </View>
                            )}
                            {!shouldShowGreenDotIndicator && optionItem.isPinned && (
                                <View
                                    style={props.themeStyles.ml2}
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

export default compose(withTheme, withThemeStyles)(React.memo(OptionRowLHN));

export {propTypes, defaultProps};
