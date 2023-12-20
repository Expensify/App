import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {GestureResponderEvent, StyleProp, StyleSheet, TextInput, View, ViewStyle} from 'react-native';
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
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import DomUtils from '@libs/DomUtils';
import {getGroupChatName} from '@libs/GroupChatUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportUtils from '@libs/ReportUtils';
import * as ContextMenuActions from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import {isNotEmptyObject} from '@src/types/utils/EmptyObject';
import {OptionRowLHNProps} from './types';

function OptionRowLHN({reportID, isFocused = false, onSelectRow = () => {}, optionItem = null, viewMode = 'default', style}: OptionRowLHNProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const isFocusedRef = useRef(true);
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();
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

    const isHidden = optionItem?.notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    if (isHidden && !isFocused && !optionItem?.isPinned) {
        return null;
    }

    const textStyle = isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = optionItem?.isUnread ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles([styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, ...textUnreadStyle], style ?? {});
    const alternateTextStyle = StyleUtils.combineStyles(
        viewMode === CONST.OPTION_MODE.COMPACT
            ? [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2]
            : [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting],
        style ?? {},
    );
    const contentContainerStyles =
        viewMode === CONST.OPTION_MODE.COMPACT ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(
        viewMode === CONST.OPTION_MODE.COMPACT
            ? ([styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter] as StyleProp<ViewStyle>)
            : ([styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter] as StyleProp<ViewStyle>),
    );
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const hasBrickError = optionItem.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const shouldShowGreenDotIndicator = !hasBrickError && ReportUtils.requiresAttentionFromCurrentUser(optionItem, optionItem.parentReportAction);
    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    const showPopover = (event: MouseEvent | GestureResponderEvent) => {
        if (!isFocusedRef.current && isSmallScreenWidth) {
            return;
        }
        setIsContextMenuActive(true);
        ReportActionContextMenu.showContextMenu(
            ContextMenuActions.CONTEXT_MENU_TYPES.REPORT,
            event,
            '',
            // @ts-expect-error TODO: Remove this once ReportActionContextMenu (https://github.com/Expensify/App/pull/32670) is migrated to TypeScript.
            popoverAnchor,
            reportID,
            '0',
            reportID,
            '',
            () => {},
            () => setIsContextMenuActive(false),
            false,
            false,
            optionItem.isPinned,
            optionItem.isUnread,
        );
    };

    const emojiCode = typeof optionItem.status === 'object' ? optionItem.status?.emojiCode : '';
    const statusText = typeof optionItem.status === 'object' ? optionItem.status?.text : '';
    const statusClearAfterDate = typeof optionItem.status === 'object' ? optionItem.status?.clearAfter : '';
    const formattedDate = DateUtils.getStatusUntilDate(statusClearAfterDate ?? '');
    const statusContent = formattedDate ? `${statusText} (${formattedDate})` : statusText;
    const report = ReportUtils.getReport(optionItem.reportID ?? '');
    const isStatusVisible = !!emojiCode && ReportUtils.isOneOnOneChat(isNotEmptyObject(report) ? report : null);

    const isGroupChat = optionItem.type === CONST.REPORT.TYPE.CHAT && optionItem.chatType && !optionItem.isThread && (optionItem.displayNamesWithTooltips?.length ?? 0) > 2;
    const fullTitle = isGroupChat ? getGroupChatName(isNotEmptyObject(report) ? report : null) : optionItem.text;

    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    return (
        <OfflineWithFeedback
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors ?? undefined}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <Hoverable>
                {(hovered) => (
                    <PressableWithSecondaryInteraction
                        ref={popoverAnchor}
                        onPress={(event) => {
                            event?.preventDefault();
                            // Enable Composer to focus on clicking the same chat after opening the context menu.
                            ReportActionComposeFocusManager.focus();
                            onSelectRow(optionItem, popoverAnchor);
                        }}
                        onMouseDown={(event) => {
                            // Allow composer blur on right click
                            if (!event) {
                                return;
                            }

                            // Prevent composer blur on left click
                            event.preventDefault();
                        }}
                        testID={optionItem.reportID}
                        onSecondaryInteraction={(event) => {
                            showPopover(event);
                            // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                            if (DomUtils.getActiveElement()) {
                                (DomUtils.getActiveElement() as HTMLElement | TextInput)?.blur();
                            }
                        }}
                        withoutFocusOnSecondaryInteraction
                        activeOpacity={0.8}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            styles.sidebarLinkInnerLHN,
                            StyleUtils.getBackgroundColorStyle(theme.sidebar),
                            isFocused ? styles.sidebarLinkActive : null,
                            (hovered || isContextMenuActive) && !isFocused ? styles.sidebarLinkHover : null,
                        ]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.navigatesToChat')}
                        needsOffscreenAlphaCompositing={(optionItem?.icons?.length ?? 0) >= 2}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {(optionItem.icons?.length ?? 0) > 0 &&
                                    (optionItem.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            backgroundColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                            mainAvatar={optionItem?.icons?.[0]}
                                            secondaryAvatar={optionItem?.icons?.[1]}
                                            size={viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={optionItem.icons ?? []}
                                            isFocusMode={viewMode === CONST.OPTION_MODE.COMPACT}
                                            size={viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                                hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                            ]}
                                            shouldShowTooltip={OptionsListUtils.shouldOptionShowTooltip(optionItem)}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                        <DisplayNames
                                            accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                                            fullTitle={fullTitle ?? ''}
                                            displayNamesWithTooltips={optionItem.displayNamesWithTooltips ?? []}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={displayNameStyle}
                                            shouldUseFullTitle={
                                                !!optionItem.isChatRoom ||
                                                !!optionItem.isPolicyExpenseChat ||
                                                !!optionItem.isTaskReport ||
                                                !!optionItem.isThread ||
                                                !!optionItem.isMoneyRequestReport
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
                                {optionItem?.descriptiveText ? (
                                    <View style={[styles.flexWrap]}>
                                        <Text style={[styles.textLabel]}>{optionItem?.descriptiveText}</Text>
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
                            {!shouldShowGreenDotIndicator && !hasBrickError && optionItem.isPinned && (
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

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
