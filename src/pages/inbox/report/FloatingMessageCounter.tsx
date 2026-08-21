import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import Text from '@components/Text';
import getActionBadgeText from '@components/utils/getActionBadgeText';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ButtonVariant} from '@styles/utils/types';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

type FloatingPillButtonProps = {
    /** Inner button variant */
    variant?: ButtonVariant;

    /** Callback when the button is pressed */
    onPress?: () => void;

    /** The icon to display */
    icon: IconAsset;

    /** The fill color for the icon */
    iconFill: string;

    /** The label text to display */
    label: string;

    /** Additional text styles */
    textStyle?: StyleProp<TextStyle>;
};

function FloatingPillButton({variant, onPress, icon, iconFill, label, textStyle}: FloatingPillButtonProps) {
    const styles = useThemeStyles();

    return (
        <Button
            variant={variant}
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.FLOATING_MESSAGE_COUNTER}
            // Restores the 12px horizontal padding from the legacy implementation.
            innerStyles={styles.ph3}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <Icon
                    size={CONST.ICON_SIZE.SMALL}
                    src={icon}
                    fill={iconFill}
                />

                <Text
                    style={[styles.ml2, styles.buttonSmallText, textStyle, styles.userSelectNone]}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    {label}
                </Text>
            </View>
        </Button>
    );
}

type FloatingMessageCounterProps = {
    /** Whether the New Messages indicator is active */
    isActive?: boolean;

    /** Whether there are new messages */
    hasNewMessages: boolean;

    /** Callback to be called when user clicks the New Messages indicator */
    onClick?: () => void;

    /** The action badge type to display (e.g. 'submit', 'approve', 'pay', 'fix') */
    actionBadge?: ValueOf<typeof CONST.REPORT.ACTION_BADGE>;

    /** The brick road status for the action badge ('error' = red, 'info' = green) */
    actionBadgeBrickRoadStatus?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Callback when the action badge pill is clicked */
    onActionBadgePress?: () => void;

    /** Whether to show "Mark as done" copy instead of "Submit" copy for track-intent users */
    shouldShowMarkAsDoneCopy?: boolean;
};

const MARKER_INACTIVE_TRANSLATE_Y = -40;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

function FloatingMessageCounter({
    isActive = false,
    onClick = () => {},
    hasNewMessages,
    actionBadge,
    actionBadgeBrickRoadStatus,
    onActionBadgePress,
    shouldShowMarkAsDoneCopy,
}: FloatingMessageCounterProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const translateY = useSharedValue(MARKER_INACTIVE_TRANSLATE_Y);

    const shouldShowActionBadgePill = !!actionBadge && !!actionBadgeBrickRoadStatus;
    const isError = actionBadgeBrickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;

    const show = useCallback(() => {
        'worklet';

        translateY.set(withSpring(MARKER_ACTIVE_TRANSLATE_Y));
    }, [translateY]);

    const hide = useCallback(() => {
        'worklet';

        translateY.set(withSpring(MARKER_INACTIVE_TRANSLATE_Y));
    }, [translateY]);

    useEffect(() => {
        if (isActive || shouldShowActionBadgePill) {
            show();
        } else {
            hide();
        }
    }, [isActive, shouldShowActionBadgePill, show, hide]);

    const wrapperStyle = useAnimatedStyle(() => ({
        ...styles.floatingMessageCounterWrapper,
        transform: [{translateY: translateY.get()}],
    }));

    const actionBadgeText = getActionBadgeText(actionBadge, translate, shouldShowMarkAsDoneCopy);

    return (
        <Animated.View
            accessibilityHint={translate(shouldShowActionBadgePill ? 'accessibilityHints.scrollToActionBadgeTarget' : 'accessibilityHints.scrollToNewestMessages')}
            style={wrapperStyle}
        >
            <View style={styles.floatingMessageCounter}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    {shouldShowActionBadgePill ? (
                        <FloatingPillButton
                            variant={isError ? CONST.BUTTON_VARIANT.DANGER : CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={onActionBadgePress}
                            icon={icons.UpArrow}
                            iconFill={theme.textLight}
                            label={actionBadgeText}
                            textStyle={styles.textWhite}
                        />
                    ) : (
                        <FloatingPillButton
                            variant={hasNewMessages ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                            onPress={onClick}
                            icon={icons.DownArrow}
                            iconFill={hasNewMessages ? theme.textLight : theme.icon}
                            label={hasNewMessages ? translate('newMessages') : translate('latestMessages')}
                            textStyle={hasNewMessages && styles.textWhite}
                        />
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

FloatingMessageCounter.displayName = 'FloatingMessageCounter';

export default React.memo(FloatingMessageCounter);
