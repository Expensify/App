import React, {useRef} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Icon from '@components/Icon';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import {isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils} from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import DescriptiveText from './OptionRow/DescriptiveText';
import DraftIndicator from './OptionRow/DraftIndicator';
import Subtitle from './OptionRow/Subtitle';
import Title from './OptionRow/Title';
import OptionRowAvatar from './OptionRowAvatar';
import OptionRowErrorBadge from './OptionRowErrorBadge';
import OptionRowInfoBadge from './OptionRowInfoBadge';
import OptionRowPressable from './OptionRowPressable';
import OptionRowTooltipLayer from './OptionRowTooltipLayer';

function OptionRowLHN({isOptionFocused = false, onSelectRow = () => {}, optionItem, viewMode = 'default', style, onLayout = () => {}, hasDraftComment, testID}: OptionRowLHNProps) {
    const {isProduction} = useEnvironment();
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pin']);

    const {onboardingPurpose, onboarding, isScreenFocused} = useLHNTooltipContext();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(optionItem, onboarding, conciergeReportID, onboardingPurpose);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];

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

    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const emojiCode = optionItem.status?.emojiCode ?? '';
    const statusText = optionItem.status?.text ?? '';
    const statusClearAfterDate = optionItem.status?.clearAfter ?? '';
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedDate = DateUtils.getStatusUntilDate(translate, statusClearAfterDate, optionItem?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone);
    const statusContent = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;
    const isStatusVisible = !!emojiCode && !!optionItem.isOneOnOneChat;

    const subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;

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

    const renderPressableRow = () => (
        <OptionRowPressable
            optionItem={optionItem}
            isOptionFocused={isOptionFocused}
            isScreenFocused={isScreenFocused}
            popoverAnchor={popoverAnchor}
            onSelectRow={onSelectRow}
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
                                    isInFocusMode={isInFocusMode}
                                    subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                    secondaryAvatarBackgroundColor={secondaryAvatarBgColor}
                                    singleAvatarContainerStyle={singleAvatarContainerStyle}
                                />
                                <View style={contentContainerStyles}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                        <Title
                                            optionItem={optionItem}
                                            displayNameStyle={displayNameStyle}
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
                                    <Subtitle
                                        optionItem={optionItem}
                                        viewMode={viewMode}
                                        isOptionFocused={isOptionFocused}
                                        style={style}
                                    />
                                </View>
                                <DescriptiveText optionItem={optionItem} />
                                <OptionRowErrorBadge
                                    brickRoadIndicator={brickRoadIndicator}
                                    actionBadgeText={actionBadgeText}
                                />
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <OptionRowInfoBadge
                                brickRoadIndicator={brickRoadIndicator}
                                actionBadgeText={actionBadgeText}
                            />
                            <DraftIndicator
                                hasDraftComment={hasDraftComment}
                                isAllowedToComment={optionItem.isAllowedToComment}
                            />
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
        <OptionRowTooltipLayer
            optionItem={optionItem}
            renderChildren={renderPressableRow}
        />
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
