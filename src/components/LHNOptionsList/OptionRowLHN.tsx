import React, {useMemo, useRef} from 'react';
import type {GestureResponderEvent, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Badge from '@components/Badge';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSession} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {containsCustomEmoji as containsCustomEmojiUtils, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import FS from '@libs/Fullstory';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isAdminRoom, isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils, isConciergeChatReport, isGroupChat, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useLHNTooltipContext} from './LHNTooltipContext';
import OptionRowAvatar from './OptionRowAvatar';
import OptionRowPressable from './OptionRowPressable';
import OptionRowTooltipLayer from './OptionRowTooltipLayer';
import type {OptionRowLHNProps} from './types';

function OptionRowLHN({
    reportID,
    report,
    isOptionFocused = false,
    onSelectRow = () => {},
    optionItem,
    viewMode = 'default',
    style,
    onLayout = () => {},
    hasDraftComment,
    testID,
    conciergeReportID,
}: OptionRowLHNProps) {
    const {isProduction} = useEnvironment();
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil', 'DotIndicator', 'Pin']);

    const {onboardingPurpose, onboarding, firstReportIDWithGBRorRBR, isScreenFocused} = useLHNTooltipContext();
    const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

    const session = useSession();
    const isOnboardingGuideAssigned = onboardingPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM && !session?.email?.includes('+');
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(report, onboarding, conciergeReportID, onboardingPurpose);
    const shouldShowGetStartedTooltip = isOnboardingGuideAssigned ? isAdminRoom(report) && isChatUsedForOnboarding : isConciergeChatReport(report);

    // When neither tooltip qualifies, skip mounting the tooltip layer so the row avoids
    // useProductTrainingContext, the tooltip-config useMemo, and the EducationalTooltip wrapper.
    const shouldEvaluateTooltip = shouldShowRBRorGBRTooltip || shouldShowGetStartedTooltip;

    const {translate} = useLocalize();
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

    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];

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
    const actionBadgeText = !isProduction && optionItem.actionBadge ? translate(`common.actionBadge.${optionItem.actionBadge}`) : '';
    let accessibilityLabelForBadge = '';
    if (brickRoadIndicator) {
        accessibilityLabelForBadge = [translate('common.yourReviewIsRequired'), actionBadgeText].filter(Boolean).join(', ');
    } else if (optionItem.isPinned) {
        accessibilityLabelForBadge = translate('common.pinned');
    }
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = shouldUseBoldText(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0, style];
    const alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2, style]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting, style];

    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const emojiCode = optionItem.status?.emojiCode ?? '';
    const statusText = optionItem.status?.text ?? '';
    const statusClearAfterDate = optionItem.status?.clearAfter ?? '';
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedDate = DateUtils.getStatusUntilDate(translate, statusClearAfterDate, optionItem?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone);
    const statusContent = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;
    const isStatusVisible = !!emojiCode && isOneOnOneChat(!isEmptyObject(report) ? report : undefined);

    const subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;

    // This is used to ensure that we display the text exactly as the user entered it when displaying LHN title, instead of parsing their text to HTML.
    const shouldParseFullTitle = optionItem?.parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(report);
    const alternateTextFSClass = FS.getChatFSClass(report);

    const onOptionPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
            name: 'OptionRowLHN',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });

        event?.preventDefault();
        // Enable Composer to focus on clicking the same chat after opening the context menu.
        ReportActionComposeFocusManager.focus();
        onSelectRow(optionItem, popoverAnchor);
    };
    const accessibilityLabel = [
        `${translate('accessibilityHints.navigatesToChat')} ${optionItem.text}`,
        optionItem.isUnread ? translate('common.unread') : '',
        optionItem.alternateText ?? '',
        accessibilityLabelForBadge,
    ]
        .filter(Boolean)
        .join('. ');
    const contextMenuHint = getContextMenuAccessibilityHint({translate});
    const {accessibilityLabel: accessibilityLabelWithContextMenuHint, accessibilityHint} = getContextMenuAccessibilityProps({
        accessibilityLabel,
        nativeAccessibilityHint: accessibilityLabel,
        contextMenuHint,
    });

    const renderRow = (onPress: typeof onOptionPress) => (
        <OptionRowPressable
            reportID={reportID}
            optionItem={optionItem}
            isOptionFocused={isOptionFocused}
            isScreenFocused={isScreenFocused}
            popoverAnchor={popoverAnchor}
            onPress={onPress}
            onLayout={onLayout}
            accessibilityLabel={accessibilityLabelWithContextMenuHint}
            accessibilityHint={accessibilityHint}
            // reportID may be a number contrary to the type definition
            testID={typeof optionItem.reportID === 'number' ? String(optionItem.reportID) : optionItem.reportID}
        >
            {(hovered) => {
                let secondaryAvatarBgColor = theme.sidebar;
                if (isOptionFocused) {
                    secondaryAvatarBgColor = focusedBackgroundColor;
                } else if (hovered) {
                    secondaryAvatarBgColor = hoveredBackgroundColor;
                }
                return (
                    <>
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <OptionRowAvatar
                                    optionItem={optionItem}
                                    report={report}
                                    isInFocusMode={isInFocusMode}
                                    subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                    secondaryAvatarBackgroundColor={secondaryAvatarBgColor}
                                    singleAvatarContainerStyle={singleAvatarContainerStyle}
                                />
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
                                        {actionBadgeText ? (
                                            <Badge
                                                text={actionBadgeText}
                                                error
                                                isStrong
                                            />
                                        ) : (
                                            <Icon
                                                testID="RBR Icon"
                                                src={expensifyIcons.DotIndicator}
                                                fill={theme.danger}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO &&
                                (actionBadgeText ? (
                                    <Badge
                                        text={actionBadgeText}
                                        success
                                        isStrong
                                    />
                                ) : (
                                    <View style={styles.ml2}>
                                        <Icon
                                            testID="GBR Icon"
                                            src={expensifyIcons.DotIndicator}
                                            fill={theme.success}
                                        />
                                    </View>
                                ))}
                            {hasDraftComment && !!optionItem.isAllowedToComment && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon
                                        testID="Pencil Icon"
                                        fill={theme.icon}
                                        src={expensifyIcons.Pencil}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
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
                                        src={expensifyIcons.Pin}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
                        </View>
                    </>
                );
            }}
        </OptionRowPressable>
    );

    return (
        <OfflineWithFeedback
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            {shouldEvaluateTooltip ? (
                <OptionRowTooltipLayer
                    shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip}
                    shouldShowGetStartedTooltip={shouldShowGetStartedTooltip}
                    onOptionPress={onOptionPress}
                    renderChildren={renderRow}
                />
            ) : (
                renderRow(onOptionPress)
            )}
        </OfflineWithFeedback>
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
