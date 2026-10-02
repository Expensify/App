import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import Icon from '@components/Icon';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ThemeColors} from '@styles/theme/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';

import {getAgentZeroProcessingLabel} from '@selectors/ReportNameValuePairs';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

import type {ConciergeThread} from './useConciergeThreads';

type AskConciergeSidebarProps = {
    /** The Concierge threads, newest first */
    threads: ConciergeThread[];

    /** The thread shown next to the list, which the list paints as the active row */
    selectedReportID?: string;

    /** Opens the blank Concierge chat */
    onAskNewQuestion: () => void;

    onSelectThread: (reportID: string) => void;
};

// A thinking thread breathes its dot rather than animating anything else in the row.
const PULSE_DURATION_MS = 700;

const EMPTY_STATE_ILLUSTRATION_SIZE = 68;
const PULSE_MIN_OPACITY = 0.3;

const conciergeProcessingSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => !!getAgentZeroProcessingLabel(reportNameValuePairs, CONST.ACCOUNT_ID.CONCIERGE);

type AskConciergeRowProps = {
    label: string;
    icon: IconAsset;

    /** The thread this row opens, which is also where Concierge reports that it is working */
    reportID: string;
    isSelected: boolean;

    /** A thread with replies the user has not read fills its dot in green */
    isUnread: boolean;

    onPress: () => void;
};

/**
 * Green means unread and nothing else, so hovering a read row leaves its dot alone: opening a thread would
 * otherwise flash the dot green on the way in.
 */
function getDotFill(isProcessing: boolean, isUnread: boolean, isSelected: boolean, theme: ThemeColors) {
    if (isProcessing) {
        return theme.icon;
    }
    if (isUnread) {
        return theme.success;
    }
    return isSelected ? theme.iconMenu : theme.icon;
}

/**
 * A row of this list reads as a row of the navigation bar beside it, so it is built from the same styles rather
 * than from FlatNavItem itself: that component fades its label with the navigation bar's collapse state, which
 * this list does not share.
 */
function AskConciergeRow({label, icon, reportID, isSelected, isUnread, onPress}: AskConciergeRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const [isProcessing = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: conciergeProcessingSelector});
    const isReducedMotionEnabled = useReducedMotion();
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (!isProcessing || isReducedMotionEnabled) {
            pulseOpacity.set(1);
            return;
        }
        pulseOpacity.set(withRepeat(withTiming(PULSE_MIN_OPACITY, {duration: PULSE_DURATION_MS, easing: Easing.inOut(Easing.ease)}), -1, true));
    }, [isProcessing, isReducedMotionEnabled, pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({opacity: pulseOpacity.get()}));

    return (
        <PressableWithFeedback
            accessibilityLabel={label}
            role={CONST.ROLE.BUTTON}
            sentryLabel="AskConcierge-Row"
            onPress={onPress}
            style={({hovered}) => [
                styles.flatNavigationBarItem,
                styles.mh0,
                isSelected && styles.navigationRowSelected,
                hovered && !isSelected && styles.navigationRowHovered,
            ]}
        >
            {({hovered}) => (
                <>
                    <Animated.View style={pulseStyle}>
                        <Icon
                            src={isProcessing ? icons.DotIndicator : icon}
                            fill={getDotFill(isProcessing, isUnread, isSelected, theme)}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                        />
                    </Animated.View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.flatNavigationBarLabel,
                            !isSelected && styles.flatNavigationBarLabelRegular,
                            {color: isSelected || hovered ? theme.text : theme.textSupporting},
                        ]}
                    >
                        {label}
                    </Text>
                </>
            )}
        </PressableWithFeedback>
    );
}

function AskConciergeSidebar({threads, selectedReportID, onAskNewQuestion, onSelectThread}: AskConciergeSidebarProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'DotIndicator', 'DotIndicatorUnfilled']);
    const illustrations = useMemoizedLazyIllustrations(['CommentBubblesBlue']);
    const {isInLandscapeMode} = useResponsiveLayout();

    return (
        <View style={[styles.flex1, styles.h100]}>
            <TopBarWithLoadingBar
                breadcrumbLabel="Concierge"
                shouldDisplaySearch={false}
            >
                {/* The top bar keeps a 12px right margin of its own, so 8px here lands the button 20px from the edge. */}
                <View style={styles.mr2}>
                    <Button
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={onAskNewQuestion}
                        sentryLabel="AskConcierge-NewQuestion"
                    >
                        <Button.Icon src={icons.Plus} />
                        <Button.Text>New</Button.Text>
                    </Button>
                </View>
            </TopBarWithLoadingBar>
            {/* The rows carry no margin of their own, so a wrapper insets the whole list the way the navigation bar is inset. */}
            {threads.length === 0 ? (
                <View style={[styles.flex1, isInLandscapeMode ? styles.pv4 : styles.emptyLHNWrapper]}>
                    <BlockingView
                        icon={illustrations.CommentBubblesBlue}
                        iconWidth={EMPTY_STATE_ILLUSTRATION_SIZE}
                        iconHeight={EMPTY_STATE_ILLUSTRATION_SIZE}
                        title="No chats"
                        titleStyles={styles.mb2}
                        CustomSubtitle={<Text style={[styles.textAlignCenter, styles.textSupporting]}>Start a new chat using the button above</Text>}
                        accessibilityLabel="No chats"
                    />
                </View>
            ) : (
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={[styles.mh3, styles.pt1]}
                >
                    {threads.map((thread) => (
                        <AskConciergeRow
                            key={thread.reportID}
                            label={thread.title}
                            icon={thread.isUnread ? icons.DotIndicator : icons.DotIndicatorUnfilled}
                            reportID={thread.reportID}
                            isSelected={thread.reportID === selectedReportID}
                            isUnread={thread.isUnread}
                            onPress={() => onSelectThread(thread.reportID)}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

export default AskConciergeSidebar;
