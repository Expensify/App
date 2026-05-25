import React, {useLayoutEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Accordion from '@components/Accordion';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {collapseProgress, peekProgress, useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchTypeMenuAccordionProps = ChildrenProps & {
    title: string;
    isExpanded: boolean;
    badgeText?: string;
    onSectionHeaderPress: () => void;
};

type AnimatedBadgeProps = {
    text: string;
    isExpanded: SharedValue<boolean>;
};

function getBadgeOpacity(isExpanded: boolean) {
    return Number(!isExpanded);
}

function getBadgeOffsetY(isExpanded: boolean): `${number}%` | number {
    return isExpanded ? '50%' : 0;
}

function getArrowRotation(isExpanded: boolean) {
    return isExpanded ? 0 : 180;
}

function AnimatedBadge({text, isExpanded}: AnimatedBadgeProps) {
    const styles = useThemeStyles();

    const badgeOpacity = useSharedValue(getBadgeOpacity(isExpanded.get()));
    const badgeOffsetY = useSharedValue(getBadgeOffsetY(isExpanded.get()));

    useAnimatedReaction(
        () => isExpanded.get(),
        (isExpandedValue) => {
            badgeOpacity.set(withTiming(getBadgeOpacity(isExpandedValue), {duration: CONST.ANIMATED_TRANSITION}));
            badgeOffsetY.set(withTiming(getBadgeOffsetY(isExpandedValue), {duration: CONST.ANIMATED_TRANSITION}));
        },
    );

    const animatedBadgeStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.get(),
        transform: [{translateY: badgeOffsetY.get()}],
    }));

    return (
        <Animated.View style={[styles.sectionHeaderBadgeStyles, animatedBadgeStyle]}>
            <Badge
                text={text}
                badgeStyles={styles.sectionHeaderBadgeTextStyles}
            />
        </Animated.View>
    );
}

function SearchTypeMenuAccordion({title, isExpanded, badgeText, children, onSectionHeaderPress}: SearchTypeMenuAccordionProps) {
    const [icons] = useMemoizedLazyExpensifyIcons(['DownPointer', 'RightPointer']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isExpanded);
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    // Re-sync the shared value with the React prop whenever the sidebar's visual state flips.
    // useAccordionAnimation only updates isAccordionExpanded when its isExpanded *prop* changes,
    // so without this re-sync the shared value can drift when the Accordion is re-rendered
    // inside a different conditional branch (e.g. divider header vs pressable header), which
    // makes a collapsed section appear expanded again after the sidebar collapses.
    useLayoutEffect(() => {
        isAccordionExpanded.set(isExpanded);
    }, [isVisuallyCollapsed, isAccordionExpanded, isExpanded]);

    const arrowRotation = useSharedValue(getArrowRotation(isExpanded));

    useAnimatedReaction(
        () => isAccordionExpanded.get(),
        (accordionExpanded) => {
            arrowRotation.set(withTiming(getArrowRotation(accordionExpanded), {duration: CONST.ANIMATED_TRANSITION}));
        },
    );

    const animatedArrowStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${arrowRotation.get()}deg`}],
    }));

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        const peek = peekProgress.get();
        // Show full header when expanded OR when peeking
        const visibility = 1 - progress * (1 - peek);
        return {
            opacity: visibility,
            height: visibility === 0 ? 0 : undefined,
            overflow: 'hidden',
        };
    });

    const dividerAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        const peek = peekProgress.get();
        const visibility = progress * (1 - peek);
        return {
            opacity: visibility,
            height: visibility > 0 ? 1 : 0,
        };
    });

    return (
        <Accordion
            isExpanded={isAccordionExpanded}
            isToggleAction={shouldAnimateAccordionSection}
            header={
                <>
                    {/* Full pressable header — visible when expanded or peeking */}
                    <Animated.View style={headerAnimatedStyle}>
                        <PressableWithoutFeedback
                            onPress={onSectionHeaderPress}
                            accessibilityLabel={title}
                            role={CONST.ROLE.BUTTON}
                            style={[styles.sectionHeader, styles.userSelectNone, styles.justifyContentBetween]}
                        >
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Animated.Text
                                    style={[styles.sectionHeaderText, styles.pre, styles.textStrong, FontUtils.fontFamily.platform.EXP_NEUE]}
                                >
                                    {title}
                                </Animated.Text>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                    {!!badgeText && (
                                        <AnimatedBadge
                                            text={badgeText}
                                            isExpanded={isAccordionExpanded}
                                        />
                                    )}
                                    <Animated.View style={[styles.sectionArrow, animatedArrowStyle]}>
                                        <Icon
                                            src={icons.DownPointer}
                                            fill={theme.icon}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                        />
                                    </Animated.View>
                                </View>
                            </View>
                        </PressableWithoutFeedback>
                    </Animated.View>

                    {/* Divider — visible when collapsed (not peeking) */}
                    <Animated.View
                        style={[
                            {
                                marginHorizontal: 12,
                                backgroundColor: theme.border,
                            },
                            dividerAnimatedStyle,
                        ]}
                    />
                </>
            }
        >
            {children}
        </Accordion>
    );
}

export default SearchTypeMenuAccordion;
