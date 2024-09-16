import React, {memo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchPersonalDetails, SearchTransactionAction} from '@src/types/onyx/SearchResults';
import ActionCell from './ActionCell';
import UserInfoCell from './UserInfoCell';

type ExpenseItemHeaderNarrowProps = {
    text?: string;
    participantFrom: SearchPersonalDetails;
    participantTo: SearchPersonalDetails;
    participantFromDisplayName: string;
    participantToDisplayName: string;
    action?: SearchTransactionAction;
    containerStyle?: StyleProp<ViewStyle>;
    onButtonPress: () => void;
    canSelectMultiple?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean | null;
    isDisabledCheckbox?: boolean;
    handleCheckboxPress?: () => void;
};

function ExpenseItemHeaderNarrow({
    participantFrom,
    participantFromDisplayName,
    participantTo,
    participantToDisplayName,
    onButtonPress,
    action,
    canSelectMultiple,
    containerStyle,
    isDisabledCheckbox,
    isSelected,
    isDisabled,
    handleCheckboxPress,
    text,
}: ExpenseItemHeaderNarrowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    // It might happen that we are missing display names for `From` or `To`, we only display arrow icon if both names exist
    const shouldDisplayArrowIcon = SearchUtils.isCorrectSearchUserName(participantFromDisplayName) && SearchUtils.isCorrectSearchUserName(participantToDisplayName);

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb3, styles.gap2, containerStyle]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flex1]}>
                {canSelectMultiple && (
                    <PressableWithFeedback
                        accessibilityLabel={text ?? ''}
                        role={CONST.ROLE.BUTTON}
                        disabled={isDisabled}
                        onPress={() => handleCheckboxPress?.()}
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled, styles.mr1]}
                    >
                        <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!isSelected, !!isDisabled)]}>
                            {isSelected && (
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={theme.textLight}
                                    height={14}
                                    width={14}
                                />
                            )}
                        </View>
                    </PressableWithFeedback>
                )}
                <View style={[styles.mw50]}>
                    <UserInfoCell
                        participant={participantFrom}
                        displayName={participantFromDisplayName}
                    />
                </View>
                {shouldDisplayArrowIcon && (
                    <Icon
                        src={Expensicons.ArrowRightLong}
                        width={variables.iconSizeXXSmall}
                        height={variables.iconSizeXXSmall}
                        fill={theme.icon}
                    />
                )}
                <View style={[styles.flex1, styles.mw50]}>
                    <UserInfoCell
                        participant={participantTo}
                        displayName={participantToDisplayName}
                    />
                </View>
            </View>
            <View style={[StyleUtils.getWidthStyle(variables.w80)]}>
                <ActionCell
                    action={action}
                    goToItem={onButtonPress}
                    isLargeScreenWidth={false}
                    isSelected={isSelected}
                />
            </View>
        </View>
    );
}

export default memo(ExpenseItemHeaderNarrow);
