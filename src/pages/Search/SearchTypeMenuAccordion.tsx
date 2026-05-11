import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Accordion from '@components/Accordion';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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

    const badgeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.get(),
        transform: [{translateY: badgeOffsetY.get()}],
    }));

    return (
        <Animated.View style={[badgeAnimatedStyle]}>
            <Badge
                text={text}
                badgeStyles={styles.searchSectionBadge}
                success
                isCondensed
            />
        </Animated.View>
    );
}

function SearchTypeMenuAccordion({title, isExpanded, badgeText, children, onSectionHeaderPress}: SearchTypeMenuAccordionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['UpArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isExpanded);

    const arrowRotation = useSharedValue(getArrowRotation(isExpanded));

    useAnimatedReaction(
        () => isAccordionExpanded.get(),
        (isExpandedValue) => {
            const rotateDegree = getArrowRotation(isExpandedValue);
            arrowRotation.set(withTiming(rotateDegree, {duration: CONST.ANIMATED_TRANSITION}));
        },
    );

    const arrowAnimatedStyle = useAnimatedStyle(() => ({transform: [{rotate: `${arrowRotation.get()}deg`}]}));

    return (
        <View>
            <PressableWithoutFeedback
                onPress={onSectionHeaderPress}
                style={[styles.flexRow, styles.p2, styles.gap2, styles.alignItemsCenter, styles.br2]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={title}
                sentryLabel={CONST.SENTRY_LABEL.ACCORDION_SECTION.TOGGLE}
                hoverStyle={styles.hoveredComponentBG}
            >
                <Text
                    style={[styles.flex1, styles.mutedNormalTextLabel]}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {title}
                </Text>
                {!!badgeText && (
                    <AnimatedBadge
                        text={badgeText}
                        isExpanded={isAccordionExpanded}
                    />
                )}
                <Animated.View style={[arrowAnimatedStyle]}>
                    <Icon
                        fill={theme.icon}
                        src={icons.UpArrow}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                    />
                </Animated.View>
            </PressableWithoutFeedback>
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                {children}
            </Accordion>
        </View>
    );
}

export default SearchTypeMenuAccordion;
