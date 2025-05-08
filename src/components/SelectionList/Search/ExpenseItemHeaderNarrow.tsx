import React, {memo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import type {SearchPersonalDetails, SearchTransactionAction} from '@src/types/onyx/SearchResults';
import ActionCell from './ActionCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

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
    isLoading?: boolean;
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
    isLoading = false,
}: ExpenseItemHeaderNarrowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    // It might happen that we are missing display names for `From` or `To`, we only display arrow icon if both names exist
    const shouldDisplayArrowIcon = isCorrectSearchUserName(participantFromDisplayName) && isCorrectSearchUserName(participantToDisplayName);

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb3, styles.gap2, containerStyle]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flex1]}>
                {!!canSelectMultiple && (
                    <PressableWithFeedback
                        accessibilityLabel={text ?? ''}
                        role={getButtonRole(true)}
                        disabled={isDisabled}
                        onPress={() => handleCheckboxPress?.()}
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled, styles.mr1]}
                    >
                        <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!isSelected, !!isDisabled)]}>
                            {!!isSelected && (
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
                <UserInfoCellsWithArrow
                    shouldDisplayArrowIcon={!!shouldDisplayArrowIcon}
                    participantFrom={participantFrom}
                    participantFromDisplayName={participantFromDisplayName}
                    participantTo={participantTo}
                    participantToDisplayName={participantToDisplayName}
                />
            </View>
            <View style={[StyleUtils.getWidthStyle(variables.w80)]}>
                <ActionCell
                    action={action}
                    goToItem={onButtonPress}
                    isLargeScreenWidth={false}
                    isSelected={isSelected}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
}

export default memo(ExpenseItemHeaderNarrow);
