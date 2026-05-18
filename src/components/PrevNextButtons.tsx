import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type PrevNextButtonsProps = {
    /** Should the previous button be disabled */
    isPrevButtonDisabled?: boolean;

    /** Should the next button be disabled */
    isNextButtonDisabled?: boolean;

    /** Moves a user to the next item */
    onNext: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Moves a user to the previous item */
    onPrevious: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

function PrevNextButtons({isPrevButtonDisabled, isNextButtonDisabled, onNext, onPrevious}: PrevNextButtonsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={styles.flexRow}>
            <PressableWithFeedback
                accessible
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={isPrevButtonDisabled}
                style={[styles.h7, styles.mr1, styles.alignItemsCenter, styles.justifyContentCenter]}
                onPress={onPrevious}
                sentryLabel={CONST.SENTRY_LABEL.PREV_NEXT_BUTTONS.PREV_BUTTON}
            >
                <View style={[styles.reportActionContextMenuMiniButton, {backgroundColor: theme.borderLighter}, isPrevButtonDisabled && styles.buttonOpacityDisabled]}>
                    <Icon
                        src={icons.BackArrow}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        fill={theme.icon}
                    />
                </View>
            </PressableWithFeedback>
            <PressableWithFeedback
                accessible
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={isNextButtonDisabled}
                style={[styles.h7, styles.alignItemsCenter, styles.justifyContentCenter]}
                onPress={onNext}
                sentryLabel={CONST.SENTRY_LABEL.PREV_NEXT_BUTTONS.NEXT_BUTTON}
            >
                <View style={[styles.reportActionContextMenuMiniButton, {backgroundColor: theme.borderLighter}, isNextButtonDisabled && styles.buttonOpacityDisabled]}>
                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                </View>
            </PressableWithFeedback>
        </View>
    );
}

export default PrevNextButtons;
