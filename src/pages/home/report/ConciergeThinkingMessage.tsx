import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import RenderHTML from '@components/RenderHTML';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Parser from '@libs/Parser';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import type {ReasoningEntry} from '@pages/inbox/AgentZeroStatusContext';
import {useAgentZeroStatus} from '@pages/inbox/AgentZeroStatusContext';
import ReportActionItemMessageHeaderSender from '@pages/inbox/report/ReportActionItemMessageHeaderSender';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ConciergeThinkingMessageProps = {
    /** The report for this thinking message */
    report: OnyxEntry<Report>;

    /** The report action if available */
    action?: OnyxEntry<ReportAction>;
};

function ConciergeThinkingMessage({report, action}: ConciergeThinkingMessageProps) {
    const {isProcessing, reasoningHistory, statusLabel} = useAgentZeroStatus();
    const shouldSuppress = useShouldSuppressConciergeIndicators(report?.reportID);

    if (!isProcessing || shouldSuppress) {
        return null;
    }

    return (
        <ConciergeThinkingMessageContent
            report={report}
            action={action}
            reasoningHistory={reasoningHistory}
            statusLabel={statusLabel}
        />
    );
}

function ConciergeThinkingMessageContent({
    report,
    action,
    reasoningHistory,
    statusLabel,
}: {
    report: OnyxEntry<Report>;
    action?: OnyxEntry<ReportAction>;
    reasoningHistory: ReasoningEntry[];
    statusLabel: string;
}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {datetimeToCalendarTime, translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);
    const hasReasoningHistory = useMemo(() => !!reasoningHistory && reasoningHistory.length > 0, [reasoningHistory]);
    const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
    const isExpanded = hasReasoningHistory && !manuallyCollapsed;
    const [isHovered, setIsHovered] = useState(false);
    const historyLength = (reasoningHistory ?? [])?.length;

    const currentTimestamp = DateUtils.getDBTime();

    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const animationDuration = 300;
    const statusLabelOpacity = useSharedValue(1);

    useEffect(() => {
        hasExpanded.set(isExpanded);
    }, [isExpanded, hasExpanded]);

    useEffect(() => {
        statusLabelOpacity.set(0.3);
        statusLabelOpacity.set(withTiming(1, {duration: 100, easing: Easing.inOut(Easing.ease)}));
    }, [statusLabel, statusLabelOpacity]);

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration: animationDuration, easing: Easing.inOut(Easing.quad)});
    });

    const animatedOpacity = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        return withTiming(hasExpanded.get() ? 1 : 0, {duration: animationDuration, easing: Easing.inOut(Easing.quad)});
    });

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get(),
        opacity: animatedOpacity.get(),
        overflow: 'hidden',
    }));

    const statusLabelAnimatedStyle = useAnimatedStyle(() => ({
        opacity: statusLabelOpacity.get(),
    }));

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const accountID = action?.actorAccountID ?? CONST.ACCOUNT_ID.CONCIERGE;
    const displayName = action?.person?.[0]?.text ?? getDisplayNameOrDefault(personalDetails?.[accountID]) ?? CONST.CONCIERGE_DISPLAY_NAME;
    const actorIcon = personalDetails?.[accountID]?.avatar ? {source: personalDetails[accountID].avatar, name: displayName, type: CONST.ICON_TYPE_AVATAR} : undefined;

    const handleToggle = () => {
        if (!hasReasoningHistory) {
            return;
        }
        setManuallyCollapsed(!manuallyCollapsed);
    };

    const getAccessibilityLabel = () => {
        if (!hasReasoningHistory) {
            return translate('common.thinking');
        }
        return isExpanded ? translate('concierge.collapseReasoning') : translate('concierge.expandReasoning');
    };

    return (
        <View style={[styles.chatItem]}>
            {/* Avatar */}
            <View
                style={[styles.alignSelfStart, styles.mr3]}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <OfflineWithFeedback pendingAction={personalDetails?.[accountID]?.pendingFields?.avatar ?? undefined}>
                    <ReportActionAvatars
                        singleAvatarContainerStyle={[styles.actionAvatar]}
                        subscriptAvatarBorderColor={theme.appBG}
                        noRightMarginOnSubscriptContainer
                        isInReportAction
                        shouldShowTooltip
                        secondaryAvatarContainerStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.appBG),
                            isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined,
                        ]}
                        reportID={report?.reportID}
                        chatReportID={report?.chatReportID ?? report?.reportID}
                        action={action}
                        accountIDs={[CONST.ACCOUNT_ID.CONCIERGE]}
                    />
                </OfflineWithFeedback>
            </View>

            {/* Message Content */}
            <View style={[styles.chatItemRight]}>
                {/* Message Header */}
                <View style={[styles.chatItemMessageHeader]}>
                    <View style={[styles.flexShrink1, styles.mr1]}>
                        <ReportActionItemMessageHeaderSender
                            accountID={accountID}
                            actorIcon={actorIcon}
                            fragmentText={displayName}
                            isSingleLine
                            shouldShowTooltip
                        />
                    </View>
                    <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(currentTimestamp, false, false)}</Text>
                </View>

                {/* Status Text with Optional Toggle */}
                <PressableWithoutFeedback
                    onPress={handleToggle}
                    disabled={!hasReasoningHistory}
                    accessibilityRole={hasReasoningHistory ? CONST.ROLE.BUTTON : undefined}
                    accessibilityLabel={getAccessibilityLabel()}
                    sentryLabel="ConciergeThinkingMessage-ToggleReasoning"
                    accessible
                >
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Animated.Text style={[styles.chatItemMessage, styles.colorMuted, statusLabelAnimatedStyle]}>{statusLabel}</Animated.Text>

                        {!!historyLength && (
                            <View style={styles.ml2}>
                                <Icon
                                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                                    fill={theme.icon}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                />
                            </View>
                        )}
                    </View>
                </PressableWithoutFeedback>

                {/* Expanded Reasoning History */}
                <Animated.View style={animatedStyle}>
                    {(isExpanded || contentHeight.get() > 0) && (
                        <View
                            style={styles.pAbsolute}
                            onLayout={(e) => {
                                const height = e.nativeEvent.layout.height;
                                if (height && height !== contentHeight.get()) {
                                    contentHeight.set(height);
                                }
                            }}
                        >
                            <View style={[styles.mt4, styles.borderLeft, styles.pl4, styles.ml1, {borderLeftWidth: 2}]}>
                                {reasoningHistory?.map((entry, index) => {
                                    return (
                                        <View
                                            key={`reasoning-${entry.timestamp}-${entry.loopCount}`}
                                            style={[index < historyLength - 1 ? styles.mb4 : styles.mb0]}
                                        >
                                            <RenderHTML html={`<comment><muted-text>${Parser.replace(entry.reasoning)}</muted-text></comment>`} />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </View>
        </View>
    );
}

export default ConciergeThinkingMessage;
