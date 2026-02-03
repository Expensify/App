import React, {useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSession} from '@components/OnyxListItemProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import DomUtils from '@libs/DomUtils';
import {containsCustomEmoji as containsCustomEmojiUtils, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import FS from '@libs/Fullstory';
import {shouldOptionShowTooltip, shouldUseBoldText} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isAdminRoom, isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils, isConciergeChatReport, isGroupChat, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import variables from '@styles/variables';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {OptionRowLHNProps} from './types';

function OptionRowLHN({
    reportID,
    report,
    isOptionFocused = false,
    onSelectRow = () => {},
    optionItem,
    viewMode = 'default',
    onboardingPurpose,
    onboarding,
    isFullscreenVisible,
    isReportsSplitNavigatorLast,
    style,
    onLayout = () => {},
    hasDraftComment,
    shouldShowRBRorGBRTooltip,
    isScreenFocused = false,
    testID,
}: OptionRowLHNProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);

    const session = useSession();
    const isOnboardingGuideAssigned = onboardingPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM && !session?.email?.includes('+');
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(report, onboarding, onboardingPurpose);
    const shouldShowGetStartedTooltip = isOnboardingGuideAssigned ? isAdminRoom(report) && isChatUsedForOnboarding : isConciergeChatReport(report);

    const {tooltipToRender, shouldShowTooltip} = useMemo(() => {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        const tooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_LHN_GBR;
        const shouldShowTooltips = shouldShowRBRorGBRTooltip || shouldShowGetStartedTooltip;
        const shouldTooltipBeVisible = shouldUseNarrowLayout ? isScreenFocused && isReportsSplitNavigatorLast : isReportsSplitNavigatorLast && !isFullscreenVisible;

        return {
            tooltipToRender: tooltip,
            shouldShowTooltip: shouldShowTooltips && shouldTooltipBeVisible,
        };
    }, [shouldShowRBRorGBRTooltip, shouldShowGetStartedTooltip, isScreenFocused, shouldUseNarrowLayout, isReportsSplitNavigatorLast, isFullscreenVisible]);

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(tooltipToRender, shouldShowTooltip);

    const {translate} = useLocalize();
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    const alternateTextContainsCustomEmojiWithText = useMemo(
        () => containsCustomEmojiUtils(optionItem?.alternateText) && !containsOnlyCustomEmoji(optionItem?.alternateText),
        [optionItem?.alternateText],
    );

    if (!optionItem && !isOptionFocused) {
        // rendering null as a render item causes the FlashList to render all
        // its children and consume significant memory on the first render. We can avoid this by
        // rendering a placeholder view instead. This behaviour is only observed when we
        // first sign in to the App.
        // We can fix this by checking if the optionItem is null and the component is not focused.
        // Which means that the currentReportID is not the same as the reportID. The currentReportID
        // in this case is empty and hence the component is not focused.
        return <View style={sidebarInnerRowStyle} />;
    }

    if (!optionItem) {
        // This is the case when the component is focused and the optionItem is null.
        // For example, when you submit an expense in offline mode and click on the
        // generated expense report, we would only see the Report Details but no item in LHN.
        return null;
    }

    const brickRoadIndicator = optionItem.brickRoadIndicator;
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = shouldUseBoldText(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0, style];
    const alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2, style]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting, style];

    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    const showPopover = (event: MouseEvent | GestureResponderEvent) => {
        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsContextMenuActive(true);
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT,
            event,
            selection: '',
            contextMenuAnchor: popoverAnchor.current,
            report: {
                reportID,
                originalReportID: reportID,
                isPinnedChat: optionItem.isPinned,
                isUnreadChat: !!optionItem.isUnread,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: () => setIsContextMenuActive(false),
            },
            withoutOverlay: false,
        });
    };

    const emojiCode = optionItem.status?.emojiCode ?? '';
    const statusText = optionItem.status?.text ?? '';
    const statusClearAfterDate = optionItem.status?.clearAfter ?? '';
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedDate = DateUtils.getStatusUntilDate(translate, statusClearAfterDate, optionItem?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone);
    const statusContent = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;
    const isStatusVisible = !!emojiCode && isOneOnOneChat(!isEmptyObject(report) ? report : undefined);

    const subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;
    const firstIcon = optionItem.icons?.at(0);

    // This is used to ensure that we display the text exactly as the user entered it when displaying LHN title, instead of parsing their text to HTML.
    const shouldParseFullTitle = optionItem?.parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(report);
    const alternateTextFSClass = FS.getChatFSClass(report);

    const onOptionPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        Performance.markStart(CONST.TIMING.OPEN_REPORT);
        Timing.start(CONST.TIMING.OPEN_REPORT);
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
            name: 'OptionRowLHN',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });

        event?.preventDefault();
        // Enable Composer to focus on clicking the same chat after opening the context menu.
        ReportActionComposeFocusManager.focus();
        hideProductTrainingTooltip();
        onSelectRow(optionItem, popoverAnchor);
    };
    return (
        <OfflineWithFeedback
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <EducationalTooltip
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                shouldRender={shouldShowProductTrainingTooltip}
                renderTooltipContent={renderProductTrainingTooltip}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                shiftHorizontal={variables.gbrTooltipShiftHorizontal}
                shiftVertical={variables.gbrTooltipShiftVertical}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                onTooltipPress={onOptionPress}
                shouldHideOnScroll
            >
                <View>
                    <Hoverable>
                        {(hovered) => (
                            <PressableWithSecondaryInteraction
                                ref={popoverAnchor}
                                onPress={onOptionPress}
                                onMouseDown={(event) => {
                                    // Allow composer blur on right click
                                    if (!event) {
                                        return;
                                    }
                                    // Prevent composer blur on left click
                                    event.preventDefault();
                                }}
                                // reportID may be a number contrary to the type definition
                                testID={typeof optionItem.reportID === 'number' ? String(optionItem.reportID) : optionItem.reportID}
                                onSecondaryInteraction={(event) => {
                                    showPopover(event);
                                    // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                                    if (DomUtils.getActiveElement()) {
                                        (DomUtils.getActiveElement() as HTMLElement | null)?.blur();
                                    }
                                }}
                                withoutFocusOnSecondaryInteraction
                                activeOpacity={variables.pressDimValue}
                                opacityAnimationDuration={0}
                                style={[
                                    styles.flexRow,
                                    styles.alignItemsCenter,
                                    styles.justifyContentBetween,
                                    styles.sidebarLink,
                                    styles.sidebarLinkInnerLHN,
                                    StyleUtils.getBackgroundColorStyle(theme.sidebar),
                                    isOptionFocused ? styles.sidebarLinkActive : null,
                                    (hovered || isContextMenuActive) && !isOptionFocused ? styles.sidebarLinkHover : null,
                                ]}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={`${translate('accessibilityHints.navigatesToChat')} ${optionItem.text}. ${optionItem.isUnread ? `${translate('common.unread')}.` : ''} ${
                                    optionItem.alternateText
                                }`}
                                onLayout={onLayout}
                                needsOffscreenAlphaCompositing={(optionItem?.icons?.length ?? 0) >= 2}
                                sentryLabel={CONST.SENTRY_LABEL.LHN.OPTION_ROW}
                            >
                                <View style={sidebarInnerRowStyle}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        {!!optionItem.icons?.length && !!firstIcon && (
                                            <ReportActionAvatars
                                                subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                                useMidSubscriptSizeForMultipleAvatars={isInFocusMode}
                                                size={isInFocusMode ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                                secondaryAvatarContainerStyle={[
                                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                    isOptionFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                                    hovered && !isOptionFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                                ]}
                                                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                                                shouldShowTooltip={shouldOptionShowTooltip(optionItem)}
                                                reportID={optionItem?.reportID}
                                            />
                                        )}
                                        <View style={contentContainerStyles}>
                                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                                <DisplayNames
                                                    accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                                                    fullTitle={optionItem.text ?? ''}
                                                    shouldParseFullTitle={shouldParseFullTitle}
                                                    displayNamesWithTooltips={optionItem.displayNamesWithTooltips ?? []}
                                                    tooltipEnabled
                                                    numberOfLines={1}
                                                    textStyles={displayNameStyle}
                                                    shouldUseFullTitle={
                                                        !!optionItem.isChatRoom ||
                                                        !!optionItem.isPolicyExpenseChat ||
                                                        !!optionItem.isTaskReport ||
                                                        !!optionItem.isThread ||
                                                        !!optionItem.isMoneyRequestReport ||
                                                        !!optionItem.isInvoiceReport ||
                                                        !!optionItem.private_isArchived ||
                                                        isGroupChat(report) ||
                                                        isSystemChat(report)
                                                    }
                                                    testID={testID}
                                                />
                                                {isChatUsedForOnboarding && <FreeTrial badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1, styles.flexShrink1]} />}
                                                {isStatusVisible && (
                                                    <Tooltip
                                                        text={statusContent}
                                                        shiftVertical={-4}
                                                    >
                                                        <Text style={styles.ml1}>{emojiCode}</Text>
                                                    </Tooltip>
                                                )}
                                            </View>
                                            {!!optionItem.alternateText && (
                                                <Text
                                                    style={alternateTextStyle}
                                                    numberOfLines={1}
                                                    accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}
                                                    fsClass={alternateTextFSClass}
                                                >
                                                    {alternateTextContainsCustomEmojiWithText ? (
                                                        <TextWithEmojiFragment
                                                            message={optionItem.alternateText}
                                                            style={[alternateTextStyle, styles.mh0]}
                                                            alignCustomEmoji
                                                        />
                                                    ) : (
                                                        optionItem.alternateText
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                        {optionItem?.descriptiveText ? (
                                            <View
                                                style={[styles.flexWrap]}
                                                fsClass={alternateTextFSClass}
                                            >
                                                <Text style={[styles.textLabel]}>{optionItem.descriptiveText}</Text>
                                            </View>
                                        ) : null}
                                        {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                            <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                                <Icon
                                                    testID="RBR Icon"
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
                                    {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO && (
                                        <View style={styles.ml2}>
                                            <Icon
                                                testID="GBR Icon"
                                                src={Expensicons.DotIndicator}
                                                fill={theme.success}
                                            />
                                        </View>
                                    )}
                                    {hasDraftComment && !!optionItem.isAllowedToComment && (
                                        <View
                                            style={styles.ml2}
                                            accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                        >
                                            <Icon
                                                testID="Pencil Icon"
                                                fill={theme.icon}
                                                src={expensifyIcons.Pencil}
                                            />
                                        </View>
                                    )}
                                    {!brickRoadIndicator && !!optionItem.isPinned && (
                                        <View
                                            style={styles.ml2}
                                            accessibilityLabel={translate('sidebarScreen.chatPinned')}
                                        >
                                            <Icon
                                                testID="Pin Icon"
                                                fill={theme.icon}
                                                src={Expensicons.Pin}
                                            />
                                        </View>
                                    )}
                                </View>
                            </PressableWithSecondaryInteraction>
                        )}
                    </Hoverable>
                </View>
            </EducationalTooltip>
        </OfflineWithFeedback>
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
