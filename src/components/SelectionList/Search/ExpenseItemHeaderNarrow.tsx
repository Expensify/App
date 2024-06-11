import React, {memo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {SearchAccountDetails} from '@src/types/onyx/SearchResults';
import UserInfoCell from './UserInfoCell';

type ExpenseItemHeaderNarrowProps = {
    participantFrom: SearchAccountDetails;
    participantTo: SearchAccountDetails;
    participantFromDisplayName: string;
    participantToDisplayName: string;
    buttonText: string;
    onButtonPress: () => void;
};

function ExpenseItemHeaderNarrow({participantFrom, participantFromDisplayName, participantTo, participantToDisplayName, buttonText, onButtonPress}: ExpenseItemHeaderNarrowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb2, styles.gap2]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.flex1]}>
                <View style={[styles.mw50]}>
                    <UserInfoCell
                        participant={participantFrom}
                        displayName={participantFromDisplayName}
                    />
                </View>
                <Icon
                    src={Expensicons.ArrowRightLong}
                    width={variables.iconSizeXXSmall}
                    height={variables.iconSizeXXSmall}
                    fill={theme.icon}
                />
                <View style={[styles.flex1, styles.mw50]}>
                    <UserInfoCell
                        participant={participantTo}
                        displayName={participantToDisplayName}
                    />
                </View>
            </View>
            <View style={[StyleUtils.getWidthStyle(variables.w80)]}>
                <Button
                    text={buttonText}
                    onPress={onButtonPress}
                    small
                    pressOnEnter
                    style={[styles.p0]}
                />
            </View>
        </View>
    );
}

export default memo(ExpenseItemHeaderNarrow);
