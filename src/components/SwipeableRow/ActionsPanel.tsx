import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {GestureResponderEvent} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import React from 'react';
import Animated, {Extrapolation, interpolate, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';

import type {SwipeableRowAction} from './types';

import {ACTION_WIDTH} from './const';
import SwipeActionIndicator from './SwipeActionIndicator';

type ActionProps = {
    action: SwipeableRowAction;

    /** The first action of a side: it sits at the outer edge and runs on a full swipe */
    isPrimary: boolean;

    /** Whether the action is revealed by swiping right */
    isLeading: boolean;

    /** Width of all actions on this side, the distance at which they are fully revealed */
    sideWidth: number;

    translateX: SharedValue<number>;
    armedProgress: SharedValue<number>;
    popScale: SharedValue<number>;
    onPress: (action: SwipeableRowAction, event?: GestureResponderEvent) => void;
};

function Action({action, isPrimary, isLeading, sideWidth, translateX, armedProgress, popScale, onPress}: ActionProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons([action.icon]);
    const idleProgress = useSharedValue(0);

    // Past the full-swipe point the primary action takes the whole side and the others fold away
    const growStyle = useAnimatedStyle(() => ({
        flexGrow: isPrimary ? 1 : 1 - armedProgress.get(),
    }));

    // Same reveal as swipe-to-reply: the icon fades and grows in as the row uncovers it
    const revealStyle = useAnimatedStyle(() => ({
        opacity: interpolate(isLeading ? translateX.get() : -translateX.get(), [0, sideWidth], [0, 1], Extrapolation.CLAMP),
    }));
    const indicatorStyle = useAnimatedStyle(() => {
        const progress = interpolate(isLeading ? translateX.get() : -translateX.get(), [0, sideWidth], [0, 1], Extrapolation.CLAMP);
        return {
            transform: [{scale: (0.5 + 0.5 * progress) * (isPrimary ? popScale.get() : 1)}],
        };
    });

    return (
        <Animated.View style={[styles.swipeableRowAction, isLeading ? styles.justifyContentEnd : styles.justifyContentStart, growStyle]}>
            <PressableWithoutFeedback
                accessibilityLabel={action.accessibilityLabel}
                role={CONST.ROLE.BUTTON}
                onPress={(event) => onPress(action, event && 'nativeEvent' in event ? event : undefined)}
                style={styles.swipeableRowActionContent}
                sentryLabel={action.sentryLabel}
            >
                <Animated.View style={[styles.alignItemsCenter, styles.gap1, revealStyle]}>
                    <SwipeActionIndicator
                        icon={icons[action.icon]}
                        tint={action.tint}
                        armedProgress={isPrimary ? armedProgress : idleProgress}
                        style={indicatorStyle}
                    />
                    <Text
                        style={styles.textMicroSupporting}
                        numberOfLines={1}
                    >
                        {action.label}
                    </Text>
                </Animated.View>
            </PressableWithoutFeedback>
        </Animated.View>
    );
}

type ActionsPanelProps = {
    actions: SwipeableRowAction[];
    isLeading: boolean;
    isOpen: boolean;
    translateX: SharedValue<number>;
    armedProgress: SharedValue<number>;
    popScale: SharedValue<number>;
    onPress: (action: SwipeableRowAction, event?: GestureResponderEvent) => void;
};

/** One side's actions. Mounted only while the row is swiped or open. */
function ActionsPanel({actions, isLeading, isOpen, translateX, armedProgress, popScale, onPress}: ActionsPanelProps) {
    const styles = useThemeStyles();
    const sideWidth = actions.length * ACTION_WIDTH;

    const panelStyle = useAnimatedStyle(() => ({
        width: Math.max(isLeading ? translateX.get() : -translateX.get(), 0),
    }));

    const renderedActions = actions.map((action, index) => (
        <Action
            key={action.key}
            action={action}
            isPrimary={index === 0}
            isLeading={isLeading}
            sideWidth={sideWidth}
            translateX={translateX}
            armedProgress={armedProgress}
            popScale={popScale}
            onPress={onPress}
        />
    ));

    return (
        <Animated.View
            style={[styles.swipeableRowActions, isLeading ? styles.swipeableRowActionsLeading : styles.swipeableRowActionsTrailing, panelStyle]}
            // Closed actions are off screen, so screen readers skip them; the row offers the same actions as accessibility actions instead
            importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
            accessibilityElementsHidden={!isOpen}
        >
            {/* The primary action sits at the outer edge: first on the leading side, last on the trailing side */}
            {isLeading ? renderedActions : renderedActions.reverse()}
        </Animated.View>
    );
}

export default ActionsPanel;
