import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type PrevNextButtonsProps = {
    /** Should the previous button be disabled */
    isPrevButtonDisabled?: boolean;

    /** Should the next button be disabled */
    isNextButtonDisabled?: boolean;

    /** Moves a user to the next item */
    onNext: () => void;

    /** Moves a user to the previous item */
    onPrevious: () => void;
};

function PrevNextButtons({isPrevButtonDisabled, isNextButtonDisabled, onNext, onPrevious}: PrevNextButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={styles.flexRow}>
            <PressableWithFeedback
                accessible
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={isPrevButtonDisabled}
                style={[styles.h10, styles.mr2, styles.alignItemsCenter, styles.justifyContentCenter, isPrevButtonDisabled && styles.buttonOpacityDisabled]}
                onPress={onPrevious}
            >
                <View style={[styles.reportActionContextMenuMiniButton, {backgroundColor: theme.borderLighter}]}>
                    <Icon
                        src={Expensicons.BackArrow}
                        small
                        fill={theme.icon}
                        isButtonIcon
                    />
                </View>
            </PressableWithFeedback>
            <PressableWithFeedback
                accessible
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                disabled={isNextButtonDisabled}
                style={[styles.h10, styles.alignItemsCenter, styles.justifyContentCenter]}
                onPress={onNext}
            >
                <View style={[styles.reportActionContextMenuMiniButton, {backgroundColor: theme.borderLighter}, isNextButtonDisabled && styles.buttonOpacityDisabled]}>
                    <Icon
                        src={Expensicons.ArrowRight}
                        small
                        fill={theme.icon}
                        isButtonIcon
                    />
                </View>
            </PressableWithFeedback>
        </View>
    );
}

export default PrevNextButtons;
